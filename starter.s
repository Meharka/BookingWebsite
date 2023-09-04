.data
sequence:  .byte 0,0,0,0
count:     .word 4
red: .byte 0, 0, 255 
green: .byte 0, 255, 0
yellow: .byte 255, 255, 0
promptA: .string "If you want to play again enter 1, else enter 0: \n"

.globl main
.text

main:
    # TODO: Before we deal with the LEDs, we need to generate a random
    # sequence of numbers that we will use to indicate the button/LED
    # to light up. For example, we can have 0 for UP, 1 for DOWN, 2 for
    # LEFT, and 3 for RIGHT. Store the sequence in memory. We provided 
    # a declaration above that you can use if you want.
    # HINT: Use the rand function provided to generate each number
    start:
    la t6, sequence
 
    addi a0, x0, 4
    jal rand
    mv t4, a0
    sb t4, 0(t6)
    addi a0, x0, 4
    jal rand
    mv t4, a0
    sb t4, 1(t6)
    addi a0, x0, 4
    jal rand
    mv t4, a0
    sb t4, 2(t6)
    addi a0, x0, 4
    jal rand
    mv t4, a0
    sb t4, 3(t6)
   
    # TODO: Now read the sequence and replay it on the LEDs. You will
    # need to use the delay function to ensure that the LEDs light up 
    # slowly. In general, for each number in the sequence you should:
    # 1. Figure out the corresponding LED location and colour
    # 2. Light up the appropriate LED (with the colour)
    # 2. Wait for a short delay (e.g. 500 ms)
    # 3. Turn off the LED (i.e. set it to black)
    # 4. Wait for a short delay (e.g. 1000 ms) before repeating
    
    Loopint: 
        addi t5, x0, 0
        addi t2, x0, 4
        #la t6, sequence
    while:
        addi t2, x0, 4
        bge t5, t2, LoopEND
        lb t3, 0(t6)
        
        IF:
            beq t3, x0, UP
            addi t4, x0, 1          
            beq t3, t4, DOWN
            addi t4, x0, 2
            beq t3, t4, LEFT
            addi t4, x0, 3
            beq t3, t4, RIGHT
            j ELSE
        UP:   ## Gotten by the up arrow on Dpad
            li a0, 0xFFFF00
            li a1, 0
            li a2, 0
            jal setLED
            addi a0, x0, 500
            jal delay
            addi t5, t5, 1
            li a0, 000
            li a1, 0
            li a2, 0
            jal setLED
            addi a0, x0, 1000
            jal delay
            addi t6, t6, 1
            j while
        RIGHT:  ## Gotten by the right arrow on Dpad
            li a0, 0x47cffc
            li a1, 1
            li a2, 0
            jal setLED
            addi a0, x0, 500
            jal delay
            addi t5, t5, 1
            li a0, 000
            li a1, 1
            li a2, 0
            jal setLED
            addi a0, x0, 1000
            jal delay
            addi t6, t6, 1
            j while
        LEFT:  ## Gotten by the left arrow on Dpad
            li a0, 0xa637a9
            li a1, 0
            li a2, 1
            jal setLED
            addi a0, x0, 500
            jal delay
            addi t5, t5, 1
            li a0, 000
            li a1, 0
            li a2, 1
            jal setLED
            addi a0, x0, 1000
            jal delay
            addi t6, t6, 1
            j while
        DOWN:  ## Gotten by the down arrow on Dpad
            li a0, 0x776f83
            li a1, 1
            li a2, 1 
            jal setLED
            addi a0, x0, 500
            jal delay
            addi t5, t5, 1
            li a0, 000
            li a1, 1
            li a2, 1
            jal setLED
            addi a0, x0, 1000
            jal delay
            addi t6, t6, 1
            j while
        ELSE:
            addi t5, t5, 1
            addi t6, t6, 1
            j while
    LoopEND:
    
    # TODO: Read through the sequence again and check for user input
    # using pollDpad. For each number in the sequence, check the d-pad
    # input and compare it against the sequence. If the input does not
    # match, display some indication of error on the LEDs and exit. 
    # Otherwise, keep checking the rest of the sequence and display 
    # some indication of success once you reach the end.
    
    la t4, sequence
    li t5, 0
    li t6, 4
    
    WHILE:
        li t6, 4
        bge t5, t6, looptermination
        jal pollDpad
        add, t3, x0, a0
        lb t2, 0(t4)
        if:
            beq t3, t2, el
            
            li a0, 0xFF0000
            li a1, 1
            li a2, 1
            jal setLED

            li a0, 0xFF0000
            li a1, 0
            li a2, 0
            jal setLED

            li a0, 0xFF0000
            li a1, 1
            li a2, 0
            jal setLED

            li a0, 0xFF0000
            li a1, 0
            li a2, 1
            jal setLED
            addi a0, x0, 500
            jal delay
            
            li a0, 0
            li a1, 1
            li a2, 1
            jal setLED
            li a0, 0
            li a1, 0
            li a2, 0
            jal setLED
            li a0, 0
            li a1, 1
            li a2, 0
            jal setLED
            li a0, 0
            li a1, 0
            li a2, 1
            jal setLED
            j IFf
        el:
            IF2:
                beq t3, x0, UP1
                addi t6, x0, 1          
                beq t3, t6, DOWN1
                addi t6, x0, 2
                beq t3, t6, LEFT1
                addi t6, x0, 3
                beq t3, t6, RIGHT1
                j ELSE1
            UP1:   ## Gotten by the up arrow on Dpad
                li a0, 0xFFFF00
                li a1, 0
                li a2, 0
                jal setLED
                addi a0, x0, 200
                jal delay
                li a0, 000
                li a1, 0
                li a2, 0
                jal setLED
                addi a0, x0, 500
                jal delay
                addi t5, t5, 1
                addi t4, t4, 1
                j WHILE
            RIGHT1:  ## Gotten by the right arrow on Dpad
                li a0, 0xFFFF00
                li a1, 1
                li a2, 0
                jal setLED
                addi a0, x0, 200
                jal delay
                li a0, 000
                li a1, 1
                li a2, 0
                jal setLED
                addi a0, x0, 500
                jal delay
                addi t5, t5, 1
                addi t4, t4, 1
                j WHILE
            LEFT1:  ## Gotten by the left arrow on Dpad
                li a0, 0xFFFF00
                li a1, 0
                li a2, 1
                jal setLED
                addi a0, x0, 200
                jal delay
                li a0, 000
                li a1, 0
                li a2, 1
                jal setLED
                addi a0, x0, 500
                jal delay
                addi t5, t5, 1
                addi t4, t4, 1
                j WHILE
            DOWN1:  ## Gotten by the down arrow on Dpad
                li a0, 0xFFFF00
                li a1, 1
                li a2, 1 
                jal setLED
                addi a0, x0, 200
                jal delay
                li a0, 000
                li a1, 1
                li a2, 1
                jal setLED
                addi a0, x0, 500
                jal delay
                addi t5, t5, 1
                addi t4, t4, 1
                j WHILE
            ELSE1:
                addi t5, t5, 1
                addi t4, t4, 1
                j WHILE
    looptermination:
        li a0, 0x00FF00
        li a1, 1
        li a2, 1
        jal setLED

        li a0, 0x00FF00
        li a1, 0
        li a2, 0
        jal setLED

        li a0, 0x00FF00
        li a1, 1
        li a2, 0
        jal setLED

        li a0, 0x00FF00
        li a1, 0
        li a2, 1
        jal setLED
        addi a0, x0, 500
        jal delay
            
        li a0, 0
        li a1, 1
        li a2, 1
        jal setLED
        li a0, 0
        li a1, 0
        li a2, 0
        jal setLED
        li a0, 0
        li a1, 1
        li a2, 0
        jal setLED
        li a0, 0
        li a1, 0
        li a2, 1
        jal setLED
        j IFf
        
    # TODO: Ask if the user wishes to play again and either loop back to
    # start a new round or terminate, based on their input.
     
     IFf:
         li a7, 4
         la a0, promptA
         ecall
         
         call readInt
         mv t1, a0
         beq t1, x0, exit
         j start
exit:
    li a7, 10
    ecall
    
    
# --- HELPER FUNCTIONS ---
# Feel free to use (or modify) them however you see fit
     
# Takes in the number of milliseconds to wait (in a0) before returning
delay:
    mv t0, a0
    li a7, 30
    ecall
    mv t1, a0
delayLoop:
    ecall
    sub t2, a0, t1
    bgez t2, delayIfEnd
    addi t2, t2, -1
delayIfEnd:
    bltu t2, t0, delayLoop
    jr ra

# Takes in a number in a0, and returns a (sort of) random number from 0 to
# this number (exclusive)
rand:
    mv t0, a0
    li a7, 30
    ecall
    remu a0, a0, t0
    jr ra
    
# Takes in an RGB color in a0, an x-coordinate in a1, and a y-coordinate
# in a2. Then it sets the led at (x, y) to the given color.
setLED:
    li t1, LED_MATRIX_0_WIDTH
    mul t0, a2, t1
    add t0, t0, a1
    li t1, 4
    mul t0, t0, t1
    li t1, LED_MATRIX_0_BASE
    add t0, t1, t0
    sw a0, (0)t0
    jr ra
    
# Polls the d-pad input until a button is pressed, then returns a number
# representing the button that was pressed in a0.
# The possible return values are:
# 0: UP
# 1: DOWN
# 2: LEFT
# 3: RIGHT
pollDpad:
    mv a0, zero
    li t1, 4
pollLoop:
    bge a0, t1, pollLoopEnd
    li t2, D_PAD_0_BASE
    slli t3, a0, 2
    add t2, t2, t3
    lw t3, (0)t2
    bnez t3, pollRelease
    addi a0, a0, 1
    j pollLoop
pollLoopEnd:
    j pollDpad
pollRelease:
    lw t3, (0)t2
    bnez t3, pollRelease
pollExit:
    jr ra
    
# Use this to read an integer from the console into a0. You're free
# to use this however you see fit.
readInt:
    addi sp, sp, -12
    li a0, 0
    mv a1, sp
    li a2, 12
    li a7, 63
    ecall
    li a1, 1
    add a2, sp, a0
    addi a2, a2, -2
    mv a0, zero
parse:
    blt a2, sp, parseEnd
    lb a7, 0(a2)
    addi a7, a7, -48
    li a3, 9
    bltu a3, a7, error1
    mul a7, a7, a1
    add a0, a0, a7
    li a3, 10
    mul a1, a1, a3
    addi a2, a2, -1
    j parse
parseEnd:
    addi sp, sp, 12
    ret

error1:
    li a7, 93
    li a0, 1
    ecall
