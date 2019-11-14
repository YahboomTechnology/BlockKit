/*
Copyright (C): 2010-2019, Shenzhen Yahboom Tech
Edited By chengengyue
"BlockKit": "file:../BlockKit"
*/

//% color="#ECA40D" weight=26 icon="\uf1b2"
namespace BlockKit {

    const PCA9685_ADD = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04

    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09

    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    const PRESCALE = 0xFE

    const STP_CHA_L = 2047
    const STP_CHA_H = 4095

    const STP_CHB_L = 1
    const STP_CHB_H = 2047

    const STP_CHC_L = 1023
    const STP_CHC_H = 3071

    const STP_CHD_L = 3071
    const STP_CHD_H = 1023

    let initialized = false
    let yahStrip: neopixel.Strip;

    export enum enMusic {

        dadadum = 0,
        entertainer,
        prelude,
        ode,
        nyan,
        ringtone,
        funk,
        blues,
        birthday,
        wedding,
        funereal,
        punchline,
        baddy,
        chase,
        ba_ding,
        wawawawaa,
        jump_up,
        jump_down,
        power_up,
        power_down
    }

    export enum enSteppers {
        B1 = 0x1,
        B2 = 0x2
    }

    export enum enPos {
        //% blockId="forward" block="forward"
        forward = 1,
        //% blockId="reverse" block="reverse"
        reverse = 2,
        //% blockId="stop" block="stop"
        stop = 3
    }

    export enum enTurns {
        //% blockId="T1B4" block="1/4"
        T1B4 = 90,
        //% blockId="T1B2" block="1/2"
        T1B2 = 180,
        //% blockId="T1B0" block="1"
        T1B0 = 360,
        //% blockId="T2B0" block="2"
        T2B0 = 720,
        //% blockId="T3B0" block="3"
        T3B0 = 1080,
        //% blockId="T4B0" block="4"
        T4B0 = 1440,
        //% blockId="T5B0" block="5"
        T5B0 = 1800
    }

    export enum enServo {
        S1 = 0,
        S2,
        S3,
        S4,
        S5,
        S6,
        S7,
        S8
    }

    export enum enMotors {
        M1 = 8,
        M2 = 10,
        M3 = 12,
        M4 = 14
    }

    export enum enCarRun {
        //% blockId="Forward" block="Forward"
        Forward = 1,
        //% blockId="Back" block="Back"
        Back,
        //% blockId="TurnLeft" block="TurnLeft"
        TurnLeft,
        //% blockId="TurnRight" block="TurnRight"
        TurnRight,
        //% blockId="Spin_Left" block="Spin_Left"
        Spin_Left,
        //% blockId="Spin_Right" block="Spin_Right"
        Spin_Right,
        //% blockId="CarStop" block="CarStop"
        CarStop
    }

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADD, MODE1, 0x00)
        setFreq(50);
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADD, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADD, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADD, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADD, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADD, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
        if (!initialized) {
            initPCA9685();
        }
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADD, buf);
    }

    function setStepper(index: number, dir: boolean): void {
        if (index == enSteppers.B1) {
            if (dir) {
                setPwm(11, STP_CHA_L, STP_CHA_H);
                setPwm(9, STP_CHB_L, STP_CHB_H);
                setPwm(10, STP_CHC_L, STP_CHC_H);
                setPwm(8, STP_CHD_L, STP_CHD_H);
            } else {
                setPwm(8, STP_CHA_L, STP_CHA_H);
                setPwm(10, STP_CHB_L, STP_CHB_H);
                setPwm(9, STP_CHC_L, STP_CHC_H);
                setPwm(11, STP_CHD_L, STP_CHD_H);
            }
        } else {
            if (dir) {
                setPwm(12, STP_CHA_L, STP_CHA_H);
                setPwm(14, STP_CHB_L, STP_CHB_H);
                setPwm(13, STP_CHC_L, STP_CHC_H);
                setPwm(15, STP_CHD_L, STP_CHD_H);
            } else {
                setPwm(15, STP_CHA_L, STP_CHA_H);
                setPwm(13, STP_CHB_L, STP_CHB_H);
                setPwm(14, STP_CHC_L, STP_CHC_H);
                setPwm(12, STP_CHD_L, STP_CHD_H);
            }
        }
    }

    function stopMotor(index: number) {
        setPwm(index, 0, 0);
        setPwm(index + 1, 0, 0);
    }

    function forward(speed: number) {
        MotorRun(enMotors.M1, speed);
        MotorRun(enMotors.M3, speed);
    }

    function back(speed: number) {
        MotorRun(enMotors.M1, -speed);
        MotorRun(enMotors.M3, -speed);
    }

    function turnLeft(speed: number) {
        MotorRun(enMotors.M1, 0);
        MotorRun(enMotors.M3, speed);
    }

    function turnRight(speed: number) {
        MotorRun(enMotors.M1, speed);
        MotorRun(enMotors.M3, 0);
    }

    function spin_Left(speed: number) {
        MotorRun(enMotors.M1, -speed);
        MotorRun(enMotors.M3, speed);
    }

    function spin_Right(speed: number) {
        MotorRun(enMotors.M1, speed);
        MotorRun(enMotors.M3, -speed);
    }

    /**
     * Use this block to replace the strip block in Neopixel
     */
    //% blockId=BlockKit_RGB_Program 
    //% block="RGB_Program"
    //% weight=99
    //% blockGap=20
    export function RGB_Program(): neopixel.Strip {
        if (!yahStrip) {
            yahStrip = neopixel.create(DigitalPin.P12, 4, NeoPixelMode.RGB);
        }
        return yahStrip;
    }

    /**
     * Play music
     */
    //% blockId=BlockKit_Music 
    //% block="Music|%index"
    //% index.fieldEditor="gridpicker"
    //% index.fieldOptions.width=200
    //% index.fieldOptions.columns=4
    //% weight=98
    //% blockGap=20
    export function Music(index: enMusic): void {
        switch (index) {
            case enMusic.dadadum: music.beginMelody(music.builtInMelody(Melodies.Dadadadum), MelodyOptions.Once); break;
            case enMusic.birthday: music.beginMelody(music.builtInMelody(Melodies.Birthday), MelodyOptions.Once); break;
            case enMusic.entertainer: music.beginMelody(music.builtInMelody(Melodies.Entertainer), MelodyOptions.Once); break;
            case enMusic.prelude: music.beginMelody(music.builtInMelody(Melodies.Prelude), MelodyOptions.Once); break;
            case enMusic.ode: music.beginMelody(music.builtInMelody(Melodies.Ode), MelodyOptions.Once); break;
            case enMusic.nyan: music.beginMelody(music.builtInMelody(Melodies.Nyan), MelodyOptions.Once); break;
            case enMusic.ringtone: music.beginMelody(music.builtInMelody(Melodies.Ringtone), MelodyOptions.Once); break;
            case enMusic.funk: music.beginMelody(music.builtInMelody(Melodies.Funk), MelodyOptions.Once); break;
            case enMusic.blues: music.beginMelody(music.builtInMelody(Melodies.Blues), MelodyOptions.Once); break;
            case enMusic.wedding: music.beginMelody(music.builtInMelody(Melodies.Wedding), MelodyOptions.Once); break;
            case enMusic.funereal: music.beginMelody(music.builtInMelody(Melodies.Funeral), MelodyOptions.Once); break;
            case enMusic.punchline: music.beginMelody(music.builtInMelody(Melodies.Punchline), MelodyOptions.Once); break;
            case enMusic.baddy: music.beginMelody(music.builtInMelody(Melodies.Baddy), MelodyOptions.Once); break;
            case enMusic.chase: music.beginMelody(music.builtInMelody(Melodies.Chase), MelodyOptions.Once); break;
            case enMusic.ba_ding: music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once); break;
            case enMusic.wawawawaa: music.beginMelody(music.builtInMelody(Melodies.Wawawawaa), MelodyOptions.Once); break;
            case enMusic.jump_up: music.beginMelody(music.builtInMelody(Melodies.JumpUp), MelodyOptions.Once); break;
            case enMusic.jump_down: music.beginMelody(music.builtInMelody(Melodies.JumpDown), MelodyOptions.Once); break;
            case enMusic.power_up: music.beginMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once); break;
            case enMusic.power_down: music.beginMelody(music.builtInMelody(Melodies.PowerDown), MelodyOptions.Once); break;
        }
    }

    /**
     * Control servo angle（0°~180°）
     */
    //% blockId=BlockKit_Servo 
    //% block="Servo(180°)|num %num|value %value"
    //% weight=97
    //% blockGap=20
    //% advanced=true
    //% num.min=1 num.max=4
    //% value.shadow="protractorPicker"
    export function Servo(num: enServo, value: number): void {
        if (value < 0) {
            value = 0;
        }else if (value > 180) {
            value = 180;
        }
        // 50hz: 20,000 us
        let us = (value * 1800 / 180 + 600);
        let pwm = us * 4096 / 20000;
        setPwm(num, 0, pwm);
    }

    /**
     * "Control servo angle（0°~270°）
     */
    //% blockId=BlockKit_Servo2 
    //% block="Servo(270°)|num %num|value %value"
    //% weight=96
    //% blockGap=20
    //% num.min=1 num.max=4 value.min=0 value.max=270
    export function Servo2(num: enServo, value: number): void {
        if (value < 0) {
            value = 0;
        }else if (value > 270) {
            value = 270;
        }
        // 50hz: 20,000 us
        let newValue = Math.map(value, 0, 270, 0, 180);
        let us = (newValue * 1800 / 180 + 600);
        let pwm = us * 4096 / 20000;
        setPwm(num, 0, pwm);
    }

    /**
     * Control servo angle（0°~360°）
     */
    //% blockId=BlockKit_Servo3 
    //% block="Servo(360°)|num %num|pos %pos|value %value"
    //% weight=96
    //% blockGap=20
    //% advanced=true
    //% num.min=1 num.max=4 value.min=0 value.max=90
    export function Servo3(num: enServo, pos: enPos, value: number): void {
        if (value < 0) {
            value = 0;
        }else if (value > 90) {
            value = 90;
        }
        // 50hz: 20,000 us
        if (pos == enPos.stop) {
            let us = (86 * 1800 / 180 + 600);
            let pwm = us * 4096 / 20000;
            setPwm(num, 0, pwm);
        }
        else if (pos == enPos.forward) { //0-90 -> 90 - 0
            let us = ((90 - value) * 1800 / 180 + 600);
            let pwm = us * 4096 / 20000;
            setPwm(num, 0, pwm);
        }
        else if (pos == enPos.reverse) { //0-90 -> 90 -180
            let us = ((90 + value) * 1800 / 180 + 600);
            let pwm = us * 4096 / 20000;
            setPwm(num, 0, pwm);
        }
    }

    /**
     * Control the speed of a single motor（-255~255），Positive number indicates forward and negative number indicates back
     */
    //% blockId=BlockKit_MotorRun 
    //% block="Motor|%index|speed(-255~255) %speed"
    //% weight=93
    //% blockGap=20
    //% speed.min=-255 speed.max=255
    export function MotorRun(index: enMotors, speed: number): void {
        speed = Math.map(speed, 0, 255, 0, 4095)
        if (speed >= 4095) {
            speed = 4095;
        }
        if (speed <= -4095) {
            speed = -4095;
        }
        let a = index;
        let b = index + 1;

        if (a > 10) {
            if (speed >= 0) {
                setPwm(a, 0, speed);
                setPwm(b, 0, 0);
            } else {
                setPwm(a, 0, 0);
                setPwm(b, 0, -speed);
            }
        }
        else {
            if (speed >= 0) {
                setPwm(b, 0, speed);
                setPwm(a, 0, 0);
            } else {
                setPwm(b, 0, 0);
                setPwm(a, 0, -speed);
            }
        }
    }

    /**
     * Control the speed of two motors at the same time（-255~255），Positive number indicates forward and negative number indicates back
     */
    //% blockId=BlockKit_MotorRunDual 
    //% block="MotorRunDual speed|%motor1|%speed1|%motor2|%speed2"
    //% weight=92
    //% blockGap=20
    //% speed1.min=-255 speed1.max=255
    //% speed2.min=-255 speed2.max=255
    //% inlineInputMode=inline
    export function MotorRunDual(motor1: enMotors, speed1: number, motor2: enMotors, speed2: number): void {
        MotorRun(motor1, speed1);
        MotorRun(motor2, speed2);
    }

    /**
     * All motors stop
     */
    //% blockId=BlockKit_MotorStopAll 
    //% block="Motor Stop All"
    //% weight=91
    //% blockGap=20
    export function MotorStopAll(): void {
        stopMotor(enMotors.M1);
        stopMotor(enMotors.M2);
        stopMotor(enMotors.M3);
        stopMotor(enMotors.M4);
    }

    /**
     * Control the rotation angle of a single stepper motor
     */
    //% blockId=BlockKit_StepperDegree 
    //% block="Stepper Motor(28BYJ-48) |%index|degree %degree"
    //% weight=90
    //% blockGap=20
    //% advanced=true
    export function StepperDegree(index: enSteppers, degree: number): void {
        setStepper(index, degree > 0);
        degree = Math.abs(degree);
        basic.pause(10240 * degree / 360);
        MotorStopAll();
    }

    /**
     * Control the number of turns of a single stepper motor
     */
    //% blockId=BlockKit_StepperTurn 
    //% block="Stepper Motor(28BYJ-48) |%index|turn %turn|circle"
    //% weight=89
    //% advanced=true
    //% blockGap=20
    export function StepperTurn(index: enSteppers, turn: enTurns): void {
        let degree = turn;
        StepperDegree(index, degree);
    }

    /**
     * Control the rotation angle of two stepper motors at the same time
     */
    //% blockId=BlockKit_StepperDual 
    //% block="Dual Stepper Motor(Degree) |M1 %degree1| M2 %degree2"
    //% weight=88
    //% advanced=true
    //% blockGap=20
    export function StepperDual(degree1: number, degree2: number): void {
        if (!initialized) {
            initPCA9685()
        }
        setStepper(1, degree1 > 0);
        setStepper(2, degree2 > 0);
        degree1 = Math.abs(degree1);
        degree2 = Math.abs(degree2);
        basic.pause(10240 * Math.min(degree1, degree2) / 360);
        if (degree1 > degree2) {
            stopMotor(enMotors.M3);
            stopMotor(enMotors.M4);
            basic.pause(10240 * (degree1 - degree2) / 360);
        } else {
            stopMotor(enMotors.M1);
            stopMotor(enMotors.M2);
            basic.pause(10240 * (degree2 - degree1) / 360);
        }
        MotorStopAll();
    }

    /**
     * Set PWM output of motor and servo to zero
     */
    //% blockId=BlockKit_PWMOFF 
    //% block="PWM OFF|%index"
    //% weight=87
    //% advanced=true
    //% blockGap=20
    //% index.min=0 index.max=15
    export function PWMOFF(index: number): void {
        setPwm(index, 0, 0);
    }

    /**
     * Control car movement
     */
    //% blockId=OmniBit_CarRun 
    //% block="CarRun|%direction|speed %speed"
    //% weight=86
    //% blockGap=20
    //% speed.min=0 speed.max=255
    export function CarRun(direction: enCarRun, speed: number): void {
        if (speed <= 0) {
            speed = 0;
        }
        switch (direction) {
            case enCarRun.Forward:
                forward(speed);
                break;
            case enCarRun.Back:
                back(speed);
                break;
            case enCarRun.TurnLeft:
                turnLeft(speed);
                break;
            case enCarRun.TurnRight:
                turnRight(speed);
                break;
            case enCarRun.Spin_Left:
                spin_Left(speed);
                break;
            case enCarRun.Spin_Right:
                spin_Right(speed);
                break;
            case enCarRun.CarStop:
                MotorRun(enMotors.M1, 0);
                MotorRun(enMotors.M3, 0);
                break;
            default:
                break;
        }
    }

    /**
     * Rocker controls the car movement. X and Y range（-512~512）
     */
    //% blockId=BlockKit_Handle 
    //% block="Handle|x %x|y %y"
    //% weight=85
    //% blockGap=20
    //% x.min=-512 x.max=512
    //% y.min=-512 y.max=512
    export function Handle(x: number, y: number): void {
        if (Math.abs(x) <= 50) {
            x = 0;
        }
        if (Math.abs(y) <= 50) {
            y = 0;
        }
        if (Math.abs(x) >= 500) {
            if (x > 0) x = 512;
            if (x < 0) x = -512;
        }
        if (Math.abs(y) >= 500) {
            if (y > 0) y = 512;
            if (y < 0) y = -512;
        }
        x = Math.map(x, -512, 512, -255, 255);
        y = Math.map(y, -512, 512, -255, 255);

        let m1 = x + y;
        let m3 = -x + y;
        MotorRun(enMotors.M1, m1);
        MotorRun(enMotors.M3, m3);
    }
}

//% color="#836FFF" weight=25 icon="\uf085"
//% groups="['Sensor Modules', 'Control Modules']"
namespace BlockKit_Module {

    export enum enObstacle {
        //% blockId="Obstacle" block="Obstacle"
        Obstacle = 0,
        //% blockId="NoObstacle" block="NoObstacle"
        NoObstacle = 1
    }

    export enum enRocker {
        //% blockId="NoState" block="NoState"
        NoState = 0,
        //% blockId="Up" block="Up"
        Up,
        //% blockId="Down" block="Down"
        Down,
        //% blockId="Left" block="Left"
        Left,
        //% blockId="Right" block="Right"
        Right,
        // //% blockId="Up_left" block="Up_left"
        // Up_left,
        // //% blockId="Up_right" block="Up_right"
        // Up_right,
        // //% blockId="Down_left" block="Down_left"
        // Down_left,
        // //% blockId="Down_right" block="Down_right"
        // Down_right,
    }

    export enum enButton {
        //% blockId="Press" block="Press"
        Press = 0,
        //% blockId="Realse" block="Realse"
        Realse = 1
    }

    export enum enAnalogPin {
        P0 = AnalogPin.P0,
        P1 = AnalogPin.P1,
        P2 = AnalogPin.P2,
        P3 = AnalogPin.P3,
        P4 = AnalogPin.P4,
        P10 = AnalogPin.P10
    }

    export enum enDigitalPin {
        P0 = DigitalPin.P0,
        P1 = DigitalPin.P1,
        P2 = DigitalPin.P2,
        P3 = DigitalPin.P3,
        P4 = DigitalPin.P4,
        P10 = DigitalPin.P10
    }

    /**
     * Returns the current illumination intensity
     */
    //% blockId=BlockKit_Module_Light 
    //% block="Light|pin %pin"
    //% group="Sensor Modules"
    //% weight=99
    //% blockGap=20
    //% color="#836FFF"
    export function Light(pin: enAnalogPin): number {
        let value: number;
        let pinNum: number = pin;
        value = pins.analogReadPin(<AnalogPin>pinNum);
        return value;
    }

    /**
     * Returns the analog value detected by the sound sensor
     */
    //% blockId=BlockKit_Module_Sound 
    //% block="Sound|pin %pin"
    //% group="Sensor Modules"
    //% weight=98
    //% blockGap=20
    //% color="#836FFF"
    export function Sound(pin: enAnalogPin): number {
        let value: number;
        let pinNum: number = pin;
        value = pins.analogReadPin(<AnalogPin>pinNum);
        return value;
    }

    /**
     * Ultrasonic detection of the front obstacle distance, Measurement Range: 2cm～500cm.
     */
    //% blockId=BlockKit_Module_Ultrasonic 
    //% block="Ultrasonic|Trig %Trig|Echo %Echo"
    //% group="Sensor Modules"
    //% color="#836FFF"
    //% weight=97
    //% blockGap=20
    export function Ultrasonic(Trig: enDigitalPin, Echo: enDigitalPin): number {
        let pinTrig: number = Trig;
        let pinEcho: number = Echo;
        // send pulse
        pins.setPull(<DigitalPin>pinTrig, PinPullMode.PullNone);
        pins.digitalWritePin(<DigitalPin>pinTrig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(<DigitalPin>pinTrig, 1);
        control.waitMicros(15);
        pins.digitalWritePin(<DigitalPin>pinTrig, 0);

        let d = pins.pulseIn(<DigitalPin>pinEcho, PulseValue.High, 43200);
        let length = Math.floor(d / 40);
        return length;
    }

    /**
     * Whether the infrared obstacle avoidance sensor detects obstacles
     */
    //% blockId=BlockKit_Module_IR 
    //% block="IR|pin %pin|value %value"
    //% group="Sensor Modules"
    //% weight=96
    //% blockGap=20
    //% color="#836FFF"
    export function IR(pin: enDigitalPin, value: enObstacle): boolean {
        let pinNum: number = pin;
        pins.setPull(<DigitalPin>pinNum, PinPullMode.PullUp);
        return pins.digitalReadPin(<DigitalPin>pinNum) == value;
    }

    /**
     * Trigger interruption when shaking
     */
    //% blockId=BlockKit_Module_Vibration 
    //% block="Vibration|pin %pin|get"
    //% group="Sensor Modules"
    //% weight=95
    //% blockGap=20
    //% color="#836FFF"
    export function Vibration(pin: enDigitalPin, handle: () => void): void {
        let pinNum: number = pin;
        pins.setPull(<DigitalPin>pinNum, PinPullMode.PullUp);
        pins.setEvents(<DigitalPin>pinNum, PinEventType.Pulse);
        pins.onPulsed(<DigitalPin>pinNum, PulseValue.High, handle);
    }

    /**
     * Trigger interruption when magnet be detected
     */
    //% blockId=BlockKit_Module_Hall 
    //% block="Hall|pin %pin|get"
    //% group="Sensor Modules"
    //% weight=94
    //% blockGap=20
    //% color="#836FFF"
    export function Hall(pin: enDigitalPin, handle: () => void): void {
        let pinNum: number = pin;
        pins.setPull(<DigitalPin>pinNum, PinPullMode.PullUp);
        pins.setEvents(<DigitalPin>pinNum, PinEventType.Pulse);
        pins.onPulsed(<DigitalPin>pinNum, PulseValue.High, handle);
    }

    /**
     * Reads the analog value of the potentiometer module
     */
    //% blockId=BlockKit_Module_Potentiometer 
    //% block="Potentiometer|pin %pin"
    //% group="Control Modules"
    //% weight=93
    //% blockGap=20
    //% color="#836FFF"
    export function Potentiometer(pin: enAnalogPin): number {
        let pinNum: number = pin;
        let value: number;
        value = pins.analogReadPin(<AnalogPin>pinNum);
        return value;
    }

    /**
     * Check whether the key module is pressed
     */
    //% blockId=BlockKit_Module_Button 
    //% block="Button|pin %pin|value %value"
    //% group="Control Modules"
    //% weight=92
    //% blockGap=20
    //% color="#836FFF"
    export function Button(pin: enDigitalPin, value: enButton): boolean {
        let pinNum: number = pin;
        pins.setPull(<DigitalPin>pinNum, PinPullMode.PullUp);
        return pins.digitalReadPin(<DigitalPin>pinNum) == value;
    }

    /**
     * Read the X-axis and Y-axis analog values of the rocker module
     */
    //% blockId=BlockKit_Module_Rocker 
    //% block="Rocker|pinX %pinX|pinY %pinY|value %value"
    //% group="Control Modules"
    //% weight=91
    //% blockGap=20
    //% color="#836FFF"
    export function Rocker(pinX: enAnalogPin, pinY: enAnalogPin, value: enRocker): boolean {
        let pinNumX: number = pinX;
        let pinNumY: number = pinY;
        let x = pins.analogReadPin(<AnalogPin>pinNumX);
        let y = pins.analogReadPin(<AnalogPin>pinNumY);
        let now_state = enRocker.NoState;

        // if (x < 200) // 左
        // {
        //     if (y > 900)    //左上
        //     {
        //         now_state = enRocker.Up_left;
        //     } else if (y < 200)    //左下
        //     {
        //         now_state = enRocker.Down_left
        //     } else {
        //         now_state = enRocker.Left;
        //     }
        // }
        // else if (x > 900) //右
        // {
        //     if (y > 900)    //右上
        //     {
        //         now_state = enRocker.Up_right;
        //     } else if (y < 200)    //右下
        //     {
        //         now_state = enRocker.Down_right
        //     } else {
        //         now_state = enRocker.Right;
        //     }
        // }
        // else  // 上下
        // {
        //     if (y < 200) //下
        //     {
        //         now_state = enRocker.Down;
        //     }
        //     else if (y > 900) //上
        //     {
        //         now_state = enRocker.Up;
        //     }
        // }
        
        if (x < 100) // 左
        {
            now_state = enRocker.Left;
        }
        else if (x > 700) //右
        {
            now_state = enRocker.Right;
        }
        else  // 上下
        {
            if (y < 100) //下
            {
                now_state = enRocker.Down;
            }
            else if (y > 700) //上
            {
                now_state = enRocker.Up;
            }
        }
        return now_state == value;
    }
}
