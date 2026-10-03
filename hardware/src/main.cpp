/**
 * ==============================================================================
 * JeevanSetu - IoT Hardware Donor Verification System
 * Platform: ESP32 NodeMCU / DevKit V1
 * Peripherals:
 *   - RC522 RFID Reader (SPI)
 *   - 128x64 I2C OLED Display (SSD1306)
 *   - Green Status LED (GPIO 25 via 220 Ohm)
 *   - Red Status LED (GPIO 26 via 220 Ohm)
 *   - Piezo Buzzer (GPIO 32)
 *
 * Hardware Pin Connections:
 *   1. RC522 SDA/SS  -> GPIO 5
 *   2. RC522 SCK     -> GPIO 18
 *   3. RC522 MOSI    -> GPIO 23
 *   4. RC522 MISO    -> GPIO 19
 *   5. RC522 IRQ     -> NC (Not Connected)
 *   6. RC522 GND     -> GND
 *   7. RC522 RST     -> GPIO 27
 *   8. RC522 3.3V    -> 3.3V
 *   9. OLED VCC      -> 3.3V
 *  10. OLED GND      -> GND
 *  11. OLED SDA      -> GPIO 21
 *  12. OLED SCL      -> GPIO 22
 *  13. Green LED (+) -> GPIO 25 (via 220 Ohm)
 *  14. Green LED (-) -> GND
 *  15. Red LED (+)   -> GPIO 26 (via 220 Ohm)
 *  16. Red LED (-)   -> GND
 *  17. Buzzer (+)    -> GPIO 32
 *  18. Buzzer (-)    -> GND
 * ==============================================================================
 */

#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#include <MFRC522.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// --- PIN DEFINITIONS (EXACT SPECIFICATION) ---
#define RC522_SS_PIN   5
#define RC522_RST_PIN  27
#define RC522_SCK_PIN  18
#define RC522_MOSI_PIN 23
#define RC522_MISO_PIN 19

#define OLED_SDA_PIN   21
#define OLED_SCL_PIN   22

#define GREEN_LED_PIN  25
#define RED_LED_PIN    26
#define BUZZER_PIN     32

// --- OLED CONFIGURATION ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// Peripheral Objects
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
MFRC522 mfrc522(RC522_SS_PIN, RC522_RST_PIN);

// Donor Registry Structure
struct DonorRecord {
  const char* uid;
  const char* name;
  const char* gender; // "Male" or "Female"
  const char* bloodGroup;
  int weightKg;
  const char* lastDonationDate;
  int daysSinceLastDonation;
  bool isAuthorized;
};

// Database of registered donors
const DonorRecord REGISTERED_DONORS[] = {
  { "A4:8B:2F:10", "Rahul Sharma", "Male",   "O+",  68, "12 July 2026",   110, true },
  { "7B:3E:91:A2", "Sneha Patil",  "Female", "B+",  54, "15 May 2026",    140, true },
  { "5C:1D:8E:44", "Amit Verma",   "Male",   "A-",  72, "08 Sept 2026",    25, true },  // Cooldown active (<90d)
  { "9D:4A:2C:77", "Priya Deshmukh","Female","AB+", 58, "24 Aug 2026",     40, true }   // Cooldown active (<120d)
};
const int NUM_REGISTERED_DONORS = sizeof(REGISTERED_DONORS) / sizeof(REGISTERED_DONORS[0]);

// Function Prototypes
void displayIdleScreen();
void displayVerifiedDonor(const DonorRecord& donor, const char* eligibleQty);
void displayAccessDenied(const char* reason, const char* cardUid);
void triggerBuzzerOneSecond();
String getCardUidString();

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[JeevanSetu] Booting ESP32 Donor Verification System...");

  // Configure Output Pins
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Initialize I2C for SSD1306 OLED (SDA: 21, SCL: 22)
  Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("[ERROR] SSD1306 OLED allocation failed");
  } else {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(10, 20);
    display.println("JeevanSetu Booting...");
    display.display();
    delay(1000);
  }

  // Initialize SPI bus for RC522 (SCK: 18, MISO: 19, MOSI: 23, SS: 5)
  SPI.begin(RC522_SCK_PIN, RC522_MISO_PIN, RC522_MOSI_PIN, RC522_SS_PIN);
  mfrc522.PCD_Init();
  delay(100);

  Serial.println("[RC522] RFID Reader initialized.");
  mfrc522.PCD_DumpVersionToSerial();

  // Self-test startup chirp (100ms)
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);

  displayIdleScreen();
}

void loop() {
  // Check if a new RFID card is presented
  if (!mfrc522.PICC_IsNewCardPresent()) {
    delay(50);
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  // Read Card UID as hex string formatted with colons
  String cardUid = getCardUidString();
  Serial.print("\n[RFID SCANNED] Card UID: ");
  Serial.println(cardUid);

  // Search donor in registry
  const DonorRecord* matchedDonor = nullptr;
  for (int i = 0; i < NUM_REGISTERED_DONORS; i++) {
    if (cardUid.equalsIgnoreCase(REGISTERED_DONORS[i].uid)) {
      matchedDonor = &REGISTERED_DONORS[i];
      break;
    }
  }

  if (matchedDonor == nullptr) {
    // -------------------------------------------------------------
    // UNAUTHORIZED / NOT REGISTERED CARD
    // -------------------------------------------------------------
    Serial.println("[ACCESS DENIED] Card not found in JeevanSetu registry.");
    
    // Red LED glows
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, LOW);

    // OLED display access denied
    displayAccessDenied("NOT REGISTERED", cardUid.c_str());

    // Buzzer beeps for 1 second showcasing error/attempt
    triggerBuzzerOneSecond();

    delay(3000);
    digitalWrite(RED_LED_PIN, LOW);
  } else {
    // -------------------------------------------------------------
    // CHECK BIOLOGICAL COOLDOWN ELIGIBILITY:
    // Men: Minimum 3 months (90 days)
    // Women: Minimum 4 months (120 days)
    // -------------------------------------------------------------
    bool isFemale = strcmp(matchedDonor->gender, "Female") == 0;
    int requiredDays = isFemale ? 120 : 90;
    bool inCooldown = matchedDonor->daysSinceLastDonation < requiredDays;

    if (inCooldown) {
      int daysRemaining = requiredDays - matchedDonor->daysSinceLastDonation;
      Serial.printf("[COOLDOWN ACTIVE] %s must wait %d more days.\n", matchedDonor->name, daysRemaining);

      digitalWrite(RED_LED_PIN, HIGH);
      digitalWrite(GREEN_LED_PIN, LOW);

      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("====================");
      display.println(" COOLDOWN ACTIVE ");
      display.println("====================");
      display.printf("Name: %s\n", matchedDonor->name);
      display.printf("Wait: %d Days Left\n", daysRemaining);
      display.printf("Rule: %s (Min %dd)\n", isFemale ? "Women" : "Men", requiredDays);
      display.display();

      // Buzzer beeps for 1 second
      triggerBuzzerOneSecond();

      delay(3000);
      digitalWrite(RED_LED_PIN, LOW);
    } else {
      // -------------------------------------------------------------
      // AUTHORIZED & FULLY ELIGIBLE DONOR:
      // Buzzer beeps for 1 second showcasing success
      // Green LED glows
      // OLED displays: Name, Blood Group, Eligible Quantity, Last Date
      // -------------------------------------------------------------
      const char* eligibleQty = (matchedDonor->weightKg >= 60) ? "450 ml" : "350 ml";

      Serial.println("[SUCCESS] Donor Authorized & Eligible!");
      Serial.printf("Name: %s | Blood: %s | Qty: %s | Last: %s\n",
                    matchedDonor->name, matchedDonor->bloodGroup, eligibleQty, matchedDonor->lastDonationDate);

      // Green LED turns ON, Red LED turns OFF
      digitalWrite(GREEN_LED_PIN, HIGH);
      digitalWrite(RED_LED_PIN, LOW);

      // OLED screen displays donor details
      displayVerifiedDonor(*matchedDonor, eligibleQty);

      // Buzzer beeps for exactly 1 second showcasing success
      triggerBuzzerOneSecond();

      // Hold verified display for 4 seconds so clinical staff can verify
      delay(4000);
      digitalWrite(GREEN_LED_PIN, LOW);
    }
  }

  // Halt PICC card to allow new scan
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();

  // Return to ready state
  displayIdleScreen();
}

/**
 * Buzzer sounds for exactly 1000 milliseconds (1 second)
 */
void triggerBuzzerOneSecond() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(1000);
  digitalWrite(BUZZER_PIN, LOW);
}

/**
 * Format RFID UID bytes into standard hex string format (e.g. "A4:8B:2F:10")
 */
String getCardUidString() {
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(mfrc522.uid.uidByte[i], HEX);
    if (i < mfrc522.uid.size - 1) uid += ":";
  }
  uid.toUpperCase();
  return uid;
}

/**
 * Display default ready screen on SSD1306 OLED
 */
void displayIdleScreen() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(14, 4);
  display.println("JeevanSetu Grid");
  display.setCursor(0, 16);
  display.println("---------------------");
  display.setCursor(6, 28);
  display.println("SCAN DONOR RFID CARD");
  display.setCursor(10, 42);
  display.println("Status: READY");
  display.setCursor(0, 54);
  display.println("Casualty Triage Node");
  display.display();
}

/**
 * Display verified donor record on SSD1306 OLED
 */
void displayVerifiedDonor(const DonorRecord& donor, const char* eligibleQty) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("** VERIFIED DONOR **");
  display.println("---------------------");
  display.printf("Name: %s\n", donor.name);
  display.printf("Blood: %s (%s)\n", donor.bloodGroup, donor.gender);
  display.printf("Eligible: %s\n", eligibleQty);
  display.printf("Last: %s\n", donor.lastDonationDate);
  display.display();
}

/**
 * Display access denied screen on SSD1306 OLED
 */
void displayAccessDenied(const char* reason, const char* cardUid) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("====================");
  display.println("  ACCESS DENIED!   ");
  display.println("====================");
  display.printf("Reason: %s\n", reason);
  display.printf("UID: %s\n", cardUid);
  display.println("Unverified Card");
  display.display();
}
