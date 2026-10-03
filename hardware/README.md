# JeevanSetu - ESP32 IoT Donor Verification Hardware Station

This directory contains the production-ready PlatformIO embedded C++ firmware for the **JeevanSetu On-Site Donor Verification Station**.

---

## 1. Pin Connections (ESP32 Dev Module)

| # | Component | Component Pin | ESP32 Pin |
| -: | --------- | ------------- | -------------------- |
| 1 | RC522 | SDA/SS | GPIO **5** |
| 2 | RC522 | SCK | GPIO **18** |
| 3 | RC522 | MOSI | GPIO **23** |
| 4 | RC522 | MISO | GPIO **19** |
| 5 | RC522 | IRQ | **NC** (Not Connected) |
| 6 | RC522 | GND | **GND** |
| 7 | RC522 | RST | GPIO **27** |
| 8 | RC522 | 3.3V | **3.3V** |
| 9 | OLED (SSD1306) | VCC | **3.3V** |
| 10 | OLED (SSD1306) | GND | **GND** |
| 11 | OLED (SSD1306) | SDA | GPIO **21** |
| 12 | OLED (SSD1306) | SCL | GPIO **22** |
| 13 | Green LED | Anode (+) | GPIO **25 via 220Ω** |
| 14 | Green LED | Cathode (-) | **GND** |
| 15 | Red LED | Anode (+) | GPIO **26 via 220Ω** |
| 16 | Red LED | Cathode (-) | **GND** |
| 17 | Buzzer | Positive (+) | GPIO **32** |
| 18 | Buzzer | Negative (-) | **GND** |

---

## 2. Hardware Operation & Business Logic

1. **Idle State**:
   - Both Green and Red LEDs are **OFF**.
   - Buzzer is **SILENT**.
   - OLED screen displays:
     ```
     JeevanSetu Grid
     ---------------------
     SCAN DONOR RFID CARD
     Status: READY
     Casualty Triage Node
     ```

2. **When Donor Scans RFID Card**:
   - The RC522 reader captures the card UID (e.g., `A4:8B:2F:10`).
   - The ESP32 evaluates the donor against registration status and biological cooldown:
     - **Men**: 3 months (90 days) minimum interval.
     - **Women**: 4 months (120 days) minimum interval.

3. **Authorized & Eligible Donor**:
   - **Buzzer beeps for exactly 1 second** (`tone`/`HIGH` for 1000ms).
   - **Green LED turns ON** for 4 seconds.
   - **Red LED remains OFF**.
   - **OLED Screen displays**:
     ```
     ** VERIFIED DONOR **
     ---------------------
     Name: <Donor Name>
     Blood: <Group> (<Gender>)
     Eligible: 450 ml / 350 ml
     Last: <Last Date>
     ```

4. **Unauthorized / Inactive Cooldown**:
   - **Buzzer beeps for 1 second** (error buzz).
   - **Red LED turns ON** for 3 seconds.
   - **Green LED remains OFF**.
   - **OLED Screen displays**:
     - *If Cooldown*: `COOLDOWN ACTIVE` + remaining days.
     - *If Unregistered*: `ACCESS DENIED` + `NOT REGISTERED`.

---

## 3. How to Build & Flash via VS Code PlatformIO

### Step 1: Open in VS Code
Open either the root folder or `hardware` directory in VS Code. PlatformIO will automatically detect `platformio.ini`.

### Step 2: Build Firmware
In the PlatformIO sidebar or terminal:
```bash
pio run
```
*(Verified: Compilation builds cleanly with 0 errors!)*

### Step 3: Flash to ESP32
Connect your ESP32 board via USB (CP210x / CH340 driver) and run:
```bash
pio run --target upload
```

### Step 4: Monitor Serial Output
```bash
pio device monitor -b 115200
```
