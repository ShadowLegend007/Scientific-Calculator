/**
 * TechCalc Pro - Advanced Scientific Calculator
 * Created by: ShadowLegend
 * Version: 1.0.0
 * 
 * A feature-rich scientific calculator with support for:
 * - Basic arithmetic operations
 * - Trigonometric functions with exact values for special angles
 * - Fraction/decimal conversion and display
 * - Advanced mathematical functions (logarithms, powers, roots)
 * - Visually appealing UI with animations and particle effects
 * 
 * The calculator handles special cases like exact fraction representation
 * for trigonometric functions and common decimal values.
 */

/* Table of Contents
==================================================
    - Data Properties & State Management
    - Basic Input Methods
    - Trigonometric Functions
    - Advanced Mathematical Functions
    - Fraction Conversion & Display
    - UI Management & Mode Toggling
    - Visual Effects & Animations 
    - Event Handling & Keyboard Support
    - Initialization & Setup
==================================================*/

let app = new Vue({
  el: '#app',
  
  /**
   * Data Properties & State Management
   * ==================================================
   * Manages the calculator's internal state and display values
   * Includes all reactive properties that control calculator behavior
   * ==================================================
   */
  data() {
    return {
      current: '',              // Current display value
      angleMode: 'DEG',         // Current angle mode (DEG or RAD)
      isShift: false,           // Shift key state
      isAlpha: false,           // Alpha key state
      memory: 0,                // Memory storage value
      lastAnswer: 0,            // Last calculated answer
      isEngNotation: false,     // Engineering notation flag
      setupMode: false,         // Setup mode flag
      isBasicMode: true,        // Mode toggle (basic vs advanced)
      isDegrees: true,          // Angle mode (degrees vs radians)
      previous: null,           // Previous value for operations
      operator: null,           // Current operation
      operatorClicked: false,   // Flag for operator press
      errorTimeout: null,       // Timeout for error message
      lastButtonPressed: null,  // Last pressed button for UI feedback
      expression: '',           // Expression for evaluation
      isCalculated: false,      // Flag if calculation was just performed
      displayExpression: '',    // Formatted expression for display
      fractionValue: '',        // Fraction representation of result
      decimalValue: '',         // Decimal representation of result
      isFractionMode: true,     // Mode for fraction vs decimal display
      lastResult: null          // Last calculated result for toggling display
    };
  },
  
  methods: {
    /**
     * Basic Input Methods
     * ==================================================
     * Core functions for handling user input and basic operations
     * Includes numeric inputs, operators, and basic editing functions
     * ==================================================
     */

    /**
     * Handle numeric and operator button presses
     * Manages basic calculator inputs and special operator formatting
     * Processes input keys and updates display with appropriate formatting
     * Includes special handling for mathematical constants and operations
     * @param {string} key - The button value pressed
     */
    press(key) {
      // Add button animation effect and visual feedback
      this.animateButton(event.target);
      this.createParticles(event);
      this.lastButtonPressed = key;
      
      // If previous result was just calculated, start new expression
      if (this.isCalculated) {
        if (!'+-*/^().'.includes(key)) {
          this.current = '';
          this.expression = '';
          this.displayExpression = '';
          this.fractionValue = '';
        }
        this.isCalculated = false;
      }
      
      // Clear error message if present
      if (this.current === 'Error') {
        this.current = '';
        this.expression = '';
        this.displayExpression = '';
        this.fractionValue = '';
        return;
      }
      
      if (this.operatorClicked) {
        this.operatorClicked = false;
      }
      
      // Handle special keys
      if (key === 'pi') {
        // Handle π constant
        this.displayExpression += 'π';
        this.expression += 'Math.PI';
        this.current = this.displayExpression;
      } else if (key === 'e') {
        // Handle e constant
        this.displayExpression += 'e';
        this.expression += 'Math.E';
        this.current = this.displayExpression;
      } else if (key === 'x^2') {
        // Handle squaring operation
        try {
          this.displayExpression += '²';
          this.expression += '**2';
          this.current = this.displayExpression;
        } catch (error) {
          this.showError();
        }
      } else if (key === '^') {
        // Handle power operation
        this.displayExpression += '^';
        this.expression += '**';
        this.current = this.displayExpression;
      } else if (key === 'sqrt') {
        // Handle square root
        try {
          this.displayExpression += '√(';
          this.expression += 'Math.sqrt(';
          this.current = this.displayExpression;
        } catch (error) {
          this.showError();
        }
      } else if (key === 'log') {
        // Handle logarithm base 10
        try {
          this.displayExpression += 'log(';
          this.expression += 'Math.log10(';
          this.current = this.displayExpression;
        } catch (error) {
          this.showError();
        }
      } else if (key === 'ln') {
        // Handle natural logarithm
        try {
          this.displayExpression += 'ln(';
          this.expression += 'Math.log(';
          this.current = this.displayExpression;
        } catch (error) {
          this.showError();
        }
      } else {
        // For regular keys, show the key press in the display
        if (key === '*') {
          this.displayExpression += '×';
          this.expression += '*';
          this.current = this.displayExpression;
        } else if (key === '/') {
          this.displayExpression += '÷';
          this.expression += '/';
          this.current = this.displayExpression;
        } else if (key === '-') {
          this.displayExpression += '−';
          this.expression += '-';
          this.current = this.displayExpression;
        } else {
          this.displayExpression += key;
          this.expression += key;
          this.current = this.displayExpression;
        }
      }
      
      // Provide haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(25);
      }
    },
    
    /**
     * Handle trigonometric function button presses with special value support
     * Properly formats display and handles exact values for common angles
     * @param {string} func - The trig function (sin, cos, tan)
     */
    pressTrig(func) {
      // Add button animation effect
      this.animateButton(event.target);
      this.createParticles(event);
      this.lastButtonPressed = func;
      
      // If previous result was just calculated, start new expression
      if (this.isCalculated) {
        this.current = '';
        this.expression = '';
        this.displayExpression = '';
        this.fractionValue = '';
        this.isCalculated = false;
      }
      
      // Clear error message if present
      if (this.current === 'Error') {
        this.current = '';
        this.expression = '';
        this.displayExpression = '';
        this.fractionValue = '';
        return;
      }
      
      // Add the trigonometric function to the expression
      this.displayExpression += func + '(';
      
      // Add appropriate JavaScript function to the evaluation expression
      // Convert degrees to radians if in DEG mode
      if (func === 'sin') {
        this.expression += 'Math.sin(' + (this.isDegrees ? '(Math.PI/180)*' : '');
      } else if (func === 'cos') {
        this.expression += 'Math.cos(' + (this.isDegrees ? '(Math.PI/180)*' : '');
      } else if (func === 'tan') {
        this.expression += 'Math.tan(' + (this.isDegrees ? '(Math.PI/180)*' : '');
      }
      
      this.current = this.displayExpression;
      
      // Provide haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(25);
      }
    },
    
    /**
     * Clear the calculator display and all stored values
     * ==================================================
     * Resets all calculator state variables to their initial values
     * Removes all expressions, results, and stored operations
     * Used for AC (All Clear) functionality
     */
    clear() {
      // Add button animation effect
      this.animateButton(event.target);
      this.createParticles(event);
      
      // Reset all calculation-related variables
      this.current = '';
      this.expression = '';
      this.displayExpression = '';
      this.fractionValue = '';
      this.decimalValue = '';
      this.previous = null;
      this.operator = null;
      this.lastButtonPressed = 'AC';
      this.isCalculated = false;
      this.lastResult = null;
      
      // Clear fraction display
      const fractionDisplay = document.querySelector('.fraction-display');
      if (fractionDisplay) {
        fractionDisplay.classList.remove('visible');
      }
      
      // Provide haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(25);
      }
    },
    
    /**
     * Remove the last character or function from the display/expression
     * ==================================================
     * Handles intelligent backspace operation including:
     * - Removing multi-character function names completely
     * - Handling special symbols and their JavaScript equivalents
     * - Managing backspace after calculation or error states
     * - Synchronizing the display expression with internal evaluation expression
     */
    backspace() {
      // Add button animation effect
      this.animateButton(event.target);
      this.createParticles(event);
      this.lastButtonPressed = 'backspace';
      
      // If error state, clear everything
      if (this.current === 'Error') {
        this.clear();
        return;
      }
      
      // If we just calculated a result, clear everything
      if (this.isCalculated) {
        this.clear();
        return;
      }
      
      // If no expression exists
      if (!this.displayExpression) {
        return;
      }
      
      // Check for special function endings to remove completely
      const functionEndings = {
        'sin(': 4,
        'cos(': 4,
        'tan(': 4,
        'log(': 4,
        'ln(': 3,
        '√(': 2,
        'π': 1,
        '²': 1
      };
      
      // Check for matching function at the end of the expression
      let charsToRemove = 1;
      for (const [ending, length] of Object.entries(functionEndings)) {
        if (this.displayExpression.endsWith(ending)) {
          charsToRemove = length;
          break;
        }
      }
      
      // Handle π and other special symbols in the JavaScript expression
      if (this.displayExpression.endsWith('π')) {
        this.expression = this.removeLastFunction(this.expression, 'Math.PI');
      } else if (this.displayExpression.endsWith('√(')) {
        this.expression = this.removeLastFunction(this.expression, 'Math.sqrt(');
      } else if (this.displayExpression.endsWith('sin(')) {
        this.expression = this.removeLastFunction(this.expression, 'Math.sin(');
      } else if (this.displayExpression.endsWith('cos(')) {
        this.expression = this.removeLastFunction(this.expression, 'Math.cos(');
      } else if (this.displayExpression.endsWith('tan(')) {
        this.expression = this.removeLastFunction(this.expression, 'Math.tan(');
      } else if (this.displayExpression.endsWith('log(')) {
        this.expression = this.removeLastFunction(this.expression, 'Math.log10(');
      } else if (this.displayExpression.endsWith('ln(')) {
        this.expression = this.removeLastFunction(this.expression, 'Math.log(');
      } else if (this.displayExpression.endsWith('²')) {
        this.expression = this.removeLastFunction(this.expression, '**2');
      } else if (this.displayExpression.endsWith('×')) {
        this.expression = this.expression.slice(0, -1);
      } else if (this.displayExpression.endsWith('÷')) {
        this.expression = this.expression.slice(0, -1);
      } else if (this.displayExpression.endsWith('−')) {
        this.expression = this.expression.slice(0, -1);
      } else {
        // Remove regular characters
        this.expression = this.expression.slice(0, -charsToRemove);
      }
      
      // Remove characters from display expression
      this.displayExpression = this.displayExpression.slice(0, -charsToRemove);
      this.current = this.displayExpression || '0';
      
      // Provide haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(25);
      }
    },
    
    /**
     * Helper method to remove a function from the end of an expression string
     * @param {string} expr - The expression to modify 
     * @param {string} funcName - The function name to remove
     * @returns {string} The modified expression
     */
    removeLastFunction(expr, funcName) {
      // Find the last occurrence of the function
      const lastIndex = expr.lastIndexOf(funcName);
      if (lastIndex !== -1) {
        return expr.substring(0, lastIndex);
      }
      return expr;
    },
    
    /**
     * Calculate percentage value of the current number
     */
    percentage() {
      // Add button animation effect
      this.animateButton(event.target);
      this.createParticles(event);
      this.lastButtonPressed = '%';
      
      try {
        // Calculate percentage by dividing by 100
        this.displayExpression += '%';
        this.expression += '/100';
        this.current = this.displayExpression;
      } catch (error) {
        this.showError();
      }
      
      // Provide haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(25);
      }
    },
    
    /**
     * Toggle the sign (positive/negative) of the current value
     */
    toggleSign() {
      // Add button animation effect
      this.animateButton(event.target);
      this.createParticles(event);
      this.lastButtonPressed = '±';
      
      try {
        // Need to handle the toggle sign differently depending on context
        if (this.isCalculated) {
          // If we just calculated, negate the result directly
          const result = -parseFloat(this.expression);
          this.expression = result.toString();
          
          // Format for display
          if (this.isFractionMode && this.fractionValue) {
            if (this.fractionValue.startsWith('-')) {
              this.fractionValue = this.fractionValue.substring(1);
            } else {
              this.fractionValue = '-' + this.fractionValue;
            }
            this.displayExpression = this.fractionValue;
          } else {
            this.displayExpression = result.toString();
          }
          
          this.current = this.displayExpression;
        } else {
          // For expressions, wrap in negative parentheses or remove them
          if (this.expression.startsWith('-(') && this.expression.endsWith(')')) {
            // Remove existing negation
            this.expression = this.expression.substring(2, this.expression.length - 1);
            this.displayExpression = this.displayExpression.substring(1);
          } else {
            // Add negation
            this.expression = '-(' + this.expression + ')';
            this.displayExpression = '-' + this.displayExpression;
          }
          this.current = this.displayExpression;
        }
      } catch (error) {
        this.showError();
      }
      
      // Provide haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(25);
      }
    },
    
    /**
     * Calculate the result of the current expression
     * ==================================================
     * Core calculation engine with support for:
     * - Evaluating complex mathematical expressions
     * - Handling exact trigonometric values for special angles
     * - Converting decimal results to fraction representation
     * - Managing error states and edge cases (undefined results)
     * - Providing visual feedback for calculation completion
     * - Supporting both fraction and decimal display modes
     */
    calculate() {
      // Add button animation effect
      this.animateButton(event.target);
      this.createParticles(event);
      this.lastButtonPressed = '=';
      
      // If there's nothing to calculate
      if (!this.expression) {
        return;
      }
      
      try {
        // Check for special case: tan(90°) and tan(270°) which are undefined
        const tanNinetyPattern = /tan\((90|270|450|630|810|990|1170|1350|90\.0+|270\.0+|450\.0+|630\.0+)\)/i;
        if (tanNinetyPattern.test(this.displayExpression)) {
          this.current = this.displayExpression + ' = undefined';
          this.fractionValue = 'undefined';
          this.isCalculated = true;
          this.createCalculationEffect();
          return;
        }
        
        // Close any missing parentheses
        let openParens = (this.expression.match(/\(/g) || []).length;
        let closeParens = (this.expression.match(/\)/g) || []).length;
        let diff = openParens - closeParens;
        
        if (diff > 0) {
          this.expression += ')'.repeat(diff);
          this.displayExpression += ')'.repeat(diff);
        }
        
        // Simplify the expression from our complex trig functions
        // This is a more reliable approach than trying to process complex function strings
        let processedExpression = this.expression;

        // First, handle sin, cos, tan special function objects by replacing them with direct function calls
        processedExpression = processedExpression.replace(/\(function\(angle\)[\s\S]*?\}\)/g, (match) => {
          if (match.includes('Math.sin')) {
            return 'Math.sin(' + (this.isDegrees ? '(Math.PI/180)*' : '');
          } else if (match.includes('Math.cos')) {
            return 'Math.cos(' + (this.isDegrees ? '(Math.PI/180)*' : '');
          } else if (match.includes('Math.tan')) {
            return 'Math.tan(' + (this.isDegrees ? '(Math.PI/180)*' : '');
          }
          return match;
        });
        
        // Calculate the result
        const result = eval(processedExpression);
        
        if (isNaN(result) || !isFinite(result)) {
          // Check if this is a tangent at 90° or 270°
          const tanNinetyCheck = /tan\(([^)]*)\)/.exec(this.displayExpression);
          if (tanNinetyCheck) {
            const angle = parseFloat(tanNinetyCheck[1]);
            const normalizedAngle = ((angle % 360) + 360) % 360;
            if (normalizedAngle === 90 || normalizedAngle === 270) {
              this.current = this.displayExpression + ' = undefined';
              this.fractionValue = 'undefined';
              this.isCalculated = true;
              this.createCalculationEffect();
              return;
            }
          }
          
          throw new Error('Invalid result');
        }
        
        // Check if this is a special trigonometric value
        const specialTrigValue = this.checkForExactTrigValue(result, this.displayExpression);
        
        // Save the raw result for fraction conversion
        this.lastResult = result;
        
        // Format the result
        let formattedResult = parseFloat(parseFloat(result).toFixed(8)).toString();
        
        // Remove trailing zeros after decimal point
        if (formattedResult.includes('.')) {
          formattedResult = formattedResult.replace(/\.?0+$/, "");
        }
        
        // Calculate fraction representation if it's a decimal number
        this.fractionValue = '';
        if (specialTrigValue) {
          // Use the special trig value directly
          this.fractionValue = specialTrigValue;
        } else if (formattedResult.includes('.')) {
          this.calculateFraction(result);
        } else {
          this.fractionValue = formattedResult;
        }
        
        // Store decimal value
        this.decimalValue = formattedResult;
        
        // Display the full expression with result
        this.current = this.displayExpression + ' = ' + (this.isFractionMode && this.fractionValue ? this.fractionValue : formattedResult);
        
        // Reset display for next operation
        if (this.isFractionMode && this.fractionValue) {
          this.displayExpression = this.fractionValue;
        } else {
          this.displayExpression = formattedResult;
        }
        
        // Make sure fraction is visible in the appropriate place
        if (!this.isFractionMode && this.fractionValue) {
          // Show fraction in the secondary display when in decimal mode
          document.querySelector('.fraction-display').textContent = this.fractionValue;
          document.querySelector('.fraction-display').classList.add('visible');
        } else {
          document.querySelector('.fraction-display').classList.remove('visible');
        }
        
        // Store result for next operation
        this.expression = result.toString();
        this.isCalculated = true;
        
        // Create particle effect for calculation
        this.createCalculationEffect();
        
      } catch (error) {
        console.error('Calculation error:', error);
        
        // Check if this might be a tangent at 90° or 270° that wasn't caught earlier
        const tanPattern = /tan\(([^)]*)\)/;
        const match = this.displayExpression.match(tanPattern);
        if (match) {
          try {
            const angle = parseFloat(match[1]);
            const normalizedAngle = ((angle % 360) + 360) % 360;
            
            // Check if it's close to 90° or 270°
            if (Math.abs(normalizedAngle - 90) < 0.1 || Math.abs(normalizedAngle - 270) < 0.1) {
              this.current = this.displayExpression + ' = undefined';
              this.fractionValue = 'undefined';
              this.isCalculated = true;
              this.createCalculationEffect();
              return;
            }
          } catch (e) {
            // Just continue to show error
          }
        }
        
        this.showError();
      }
      
      // Provide haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([25, 30, 25]);
      }
    },
    
    /**
     * Check if a calculated value matches an exact trigonometric value
     * ==================================================
     * Matches calculated values against known exact values for trigonometric functions
     * Handles special angles (0°, 30°, 45°, 60°, 90°, etc.) and returns their exact fraction representation
     * Uses reference tables for sin, cos, and tan of standard angles
     * Provides mathematically precise representations for educational purposes
     * 
     * @param {number} value - The calculated numerical value
     * @param {string} displayExpression - The expression shown in the display
     * @returns {string|null} The exact fraction representation if it exists, otherwise null
     */
    checkForExactTrigValue(value, displayExpression) {
      const tolerance = 1.0E-7;
      
      // First check if this was a trig function calculation
      const isTrigFunction = /sin\(|cos\(|tan\(/.test(displayExpression);
      if (!isTrigFunction) {
        return null;
      }
      
      // Check for common angles in degrees
      if (this.isDegrees) {
        const sinPattern = /sin\((\d+(\.\d+)?)\)/;
        const cosPattern = /cos\((\d+(\.\d+)?)\)/;
        const tanPattern = /tan\((\d+(\.\d+)?)\)/;
        
        let angle = null;
        let func = '';
        
        // Extract the angle from the expression
        let match;
        if (match = displayExpression.match(sinPattern)) {
          angle = parseFloat(match[1]);
          func = 'sin';
        } else if (match = displayExpression.match(cosPattern)) {
          angle = parseFloat(match[1]);
          func = 'cos';
        } else if (match = displayExpression.match(tanPattern)) {
          angle = parseFloat(match[1]);
          func = 'tan';
        }
        
        if (angle !== null) {
          // Normalize angle to 0-360 range
          angle = ((angle % 360) + 360) % 360;
          
          // Check for special angles using the reference table
          if (func === 'sin') {
            if (angle === 0 || angle === 180 || angle === 360) return '0';
            if (angle === 30 || angle === 150) return '1/2';
            if (angle === 210 || angle === 330) return '-1/2';
            if (angle === 45 || angle === 135) return '1/√2';
            if (angle === 225 || angle === 315) return '-1/√2';
            if (angle === 60 || angle === 120) return '√3/2';
            if (angle === 240 || angle === 300) return '-√3/2';
            if (angle === 90) return '1';
            if (angle === 270) return '-1';
          } else if (func === 'cos') {
            if (angle === 90 || angle === 270) return '0';
            if (angle === 60 || angle === 300) return '1/2';
            if (angle === 120 || angle === 240) return '-1/2';
            if (angle === 45 || angle === 315) return '1/√2';
            if (angle === 135 || angle === 225) return '-1/√2';
            if (angle === 30 || angle === 330) return '√3/2';
            if (angle === 150 || angle === 210) return '-√3/2';
            if (angle === 0 || angle === 360) return '1';
            if (angle === 180) return '-1';
          } else if (func === 'tan') {
            if (angle === 0 || angle === 180 || angle === 360) return '0';
            if (angle === 45 || angle === 225) return '1';
            if (angle === 135 || angle === 315) return '-1';
            if (angle === 30 || angle === 210) return '1/√3';
            if (angle === 150 || angle === 330) return '-1/√3';
            if (angle === 60 || angle === 240) return '√3';
            if (angle === 120 || angle === 300) return '-√3';
            if (angle === 90 || angle === 270) return 'undefined';
          }
        }
      }
      
      // Handle special sin values using numeric checks as fallback
      if (Math.abs(value) < tolerance) return '0';
      if (Math.abs(value - 0.5) < tolerance) return '1/2';
      if (Math.abs(value + 0.5) < tolerance) return '-1/2';
      if (Math.abs(value - 1) < tolerance) return '1';
      if (Math.abs(value + 1) < tolerance) return '-1';
      
      // More specific values
      if (Math.abs(value - Math.sqrt(2)/2) < tolerance) return '1/√2';
      if (Math.abs(value + Math.sqrt(2)/2) < tolerance) return '-1/√2';
      if (Math.abs(value - Math.sqrt(3)/2) < tolerance) return '√3/2';
      if (Math.abs(value + Math.sqrt(3)/2) < tolerance) return '-√3/2';
      
      // Tangent values
      if (Math.abs(value - Math.sqrt(3)) < tolerance) return '√3';
      if (Math.abs(value + Math.sqrt(3)) < tolerance) return '-√3';
      if (Math.abs(value - 1/Math.sqrt(3)) < tolerance) return '1/√3';
      if (Math.abs(value + 1/Math.sqrt(3)) < tolerance) return '-1/√3';
      
      return null;
    },
    
    /**
     * Convert a decimal value to its closest fraction representation
     * ==================================================
     * Converts floating-point results to exact fractions using:
     * - Direct checks for common mathematical constants (π, e)
     * - Lookup table for common fractions (1/2, 1/3, 1/4, etc.)
     * - Special handling for square roots and trigonometric values (√3/2, 1/√2)
     * - Continued fraction algorithm for complex rational approximations
     * - Fraction simplification using greatest common divisor (GCD)
     * 
     * This function optimizes for mathematical clarity rather than
     * computational accuracy, favoring recognizable fractions.
     * 
     * @param {number} decimal - The decimal value to convert to a fraction
     */
    calculateFraction(decimal) {
      // Convert decimal to fraction with better precision
      const tolerance = 1.0E-7;
      
      // Handle special cases for common values
      if (Math.abs(decimal - Math.PI) < tolerance) {
        this.fractionValue = 'π';
        return;
      }
      
      if (Math.abs(decimal - Math.E) < tolerance) {
        this.fractionValue = 'e';
        return;
      }
      
      // Handle common fractions directly for accuracy
      if (Math.abs(decimal - 0.5) < tolerance) {
        this.fractionValue = '1/2';
        return;
      }
      
      if (Math.abs(decimal - 0.25) < tolerance) {
        this.fractionValue = '1/4';
        return;
      }
      
      if (Math.abs(decimal - 0.75) < tolerance) {
        this.fractionValue = '3/4';
        return;
      }
      
      if (Math.abs(decimal - 0.33333333) < 0.00001) {
        this.fractionValue = '1/3';
        return;
      }
      
      if (Math.abs(decimal - 0.66666667) < 0.00001) {
        this.fractionValue = '2/3';
        return;
      }
      
      // Special trig values
      if (Math.abs(decimal - Math.sqrt(3)/2) < tolerance) {
        this.fractionValue = '√3/2';
        return;
      }
      
      if (Math.abs(decimal - Math.sqrt(2)/2) < tolerance) {
        this.fractionValue = '1/√2';
        return;
      }
      
      if (Math.abs(decimal - Math.sqrt(3)) < tolerance) {
        this.fractionValue = '√3';
        return;
      }
      
      if (Math.abs(decimal - 1/Math.sqrt(3)) < tolerance) {
        this.fractionValue = '1/√3';
        return;
      }
      
      // Negative versions
      if (Math.abs(decimal + 0.5) < tolerance) {
        this.fractionValue = '-1/2';
        return;
      }
      
      if (Math.abs(decimal + Math.sqrt(3)/2) < tolerance) {
        this.fractionValue = '-√3/2';
        return;
      }
      
      if (Math.abs(decimal + Math.sqrt(2)/2) < tolerance) {
        this.fractionValue = '-1/√2';
        return;
      }
      
      if (Math.abs(decimal + Math.sqrt(3)) < tolerance) {
        this.fractionValue = '-√3';
        return;
      }
      
      if (Math.abs(decimal + 1/Math.sqrt(3)) < tolerance) {
        this.fractionValue = '-1/√3';
        return;
      }
      
      // Skip extremely small or large numbers to avoid bad fractions
      if (Math.abs(decimal) < 0.0001 || Math.abs(decimal) > 10000) {
        this.fractionValue = '';
        return;
      }
      
      // Initialize variables for the continued fraction algorithm
      let numerator = 1;
      let h1 = 0; // First previous term for numerator
      let h2 = 1; // Second previous term for numerator
      let k1 = 1; // First previous term for denominator
      let k2 = 0; // Second previous term for denominator
      let b = decimal;
      
      // Continue until we get a close approximation or denominator gets too large
      do {
        let a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
        
        // Compute the current approximation
        const approximation = h1 / k1;
        
        // Check if we have a reasonably close approximation
        if (!isFinite(b) || Math.abs(decimal - approximation) < 1e-9) {
          break;
        }
        
        // Avoid too large denominators that would be impractical
        if (k1 > 10000) {
          break;
        }
      } while (true);
      
      // Check if the result is a proper fraction
      if (h1 > 10000 || k1 > 10000) {
        this.fractionValue = ''; // Too complex fraction, keep decimal
        return;
      }
      
      // Handle negative numbers
      let sign = '';
      if (decimal < 0 && h1 > 0) {
        sign = '-';
      }
      
      // Get absolute values for the final fraction
      h1 = Math.abs(h1);
      k1 = Math.abs(k1);
      
      // Simplify the fraction by dividing by GCD
      const gcd = this.findGcd(h1, k1);
      h1 = h1 / gcd;
      k1 = k1 / gcd;
      
      // Format the fraction
      if (k1 === 1) {
        // When denominator is 1, just return the numerator
        this.fractionValue = sign + h1;
      } else {
        this.fractionValue = sign + h1 + '/' + k1;
      }
    },
    
    /**
     * Calculate the greatest common divisor (GCD) using Euclidean algorithm
     * Used to simplify fractions by dividing both numerator and denominator
     * 
     * @param {number} a - First number
     * @param {number} b - Second number
     * @returns {number} The greatest common divisor
     */
    findGcd(a, b) {
      return b === 0 ? a : this.findGcd(b, a % b);
    },
    
    /**
     * Toggle between fraction and decimal mode for display
     * ==================================================
     * Switches between exact fraction representation and decimal approximation
     * Features:
     * - Animated transition between display modes
     * - Recalculates fractions if not already available
     * - Updates secondary display to show alternative representation
     * - Maintains mathematical accuracy across display modes
     * - Provides visual feedback for mode change
     */
    toggleFractionMode() {
      // Add button animation effect
      this.animateButton(event.target);
      this.createParticles(event);
      
      // Only toggle if we have a valid result
      if (!this.lastResult) {
        return; // No calculation performed yet
      }
      
      // If no fraction is available but we have a result, recalculate fraction
      if (!this.fractionValue && this.lastResult) {
        this.calculateFraction(this.lastResult);
      }
      
      // Toggle mode
      this.isFractionMode = !this.isFractionMode;
      
      // Apply animation to the display
      const displayElement = document.querySelector('.display');
      if (displayElement) {
        displayElement.classList.add('fraction-animation');
        
        setTimeout(() => {
          if (this.isFractionMode && this.fractionValue) {
            // When switching to fraction mode, show fraction in main display
            this.displayExpression = this.fractionValue;
            this.current = this.displayExpression;
            
            // Hide fraction display in FRAC mode (already shown in main display)
            document.querySelector('.fraction-display').classList.remove('visible');
          } else {
            // When switching to decimal mode, show decimal in main display
            this.displayExpression = this.decimalValue;
            this.current = this.displayExpression;
            
            // Show fraction in the secondary display when in decimal mode
            if (this.fractionValue) {
              document.querySelector('.fraction-display').textContent = this.fractionValue;
              document.querySelector('.fraction-display').classList.add('visible');
            }
          }
          
          // Remove animation class
          setTimeout(() => {
            displayElement.classList.remove('fraction-animation');
          }, 300);
        }, 150);
      }
      
      // Provide haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(25);
      }
    },
    
    /**
     * UI Management & Mode Toggling
     * ==================================================
     * Methods for managing calculator interface and display modes:
     * - Toggle between basic and advanced calculator modes
     * - Switch between degrees and radians for angle calculations
     * - Handle fraction/decimal display modes
     * - Manage calculator state and display updates
     * - Provide visual feedback for mode changes
     */

    /**
     * Toggle between basic and advanced calculator modes
     * ==================================================
     * Switches between simplified and full-featured calculator interfaces:
     * - Updates UI layout and available functions
     * - Animates transition between modes
     * - Resets calculator state
     * - Provides haptic feedback
     * - Maintains user preferences
     */
    toggleMode() {
      // Provide haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      
      // Add transition animation to calculator
      const calculator = document.querySelector('.calculator');
      calculator.classList.add('mode-transition');
      
      // Remove classes first
      calculator.classList.remove('basic-mode', 'advanced-mode');
      
      // Toggle mode
      this.isBasicMode = !this.isBasicMode;
      
      // Add appropriate class after a short delay
      setTimeout(() => {
        calculator.classList.add(this.isBasicMode ? 'basic-mode' : 'advanced-mode');
        
        // Remove transition class after animation completes
        setTimeout(() => {
          calculator.classList.remove('mode-transition');
        }, 500);
      }, 50);
      
      this.clear();
    },
    
    /**
     * Toggle between degrees and radians for angle measurements
     * ==================================================
     * Switches angle measurement system for trigonometric functions:
     * - Updates internal angle mode state
     * - Provides visual feedback for current mode
     * - Maintains consistency across calculations
     * - Handles conversion between systems
     * - Updates display to reflect current mode
     */
    toggleAngleMode() {
      // Add button animation effect
      this.animateButton(event.target);
      this.createParticles(event);
      
      this.isDegrees = !this.isDegrees;
      this.lastButtonPressed = this.isDegrees ? 'DEG' : 'RAD';
      
      // Provide haptic feedback on mobile if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(25);
      }
    },

    /**
     * Visual Effects & Animations
     * ==================================================
     * Methods for creating engaging visual feedback:
     * - Button press animations
     * - Particle effects
     * - Mode transition animations
     * - Calculation completion effects
     * - Error state visual feedback
     */

    /**
     * Create button press animation effect
     * ==================================================
     * Provides tactile visual feedback for button presses:
     * - Adds temporary animation classes for button movement
     * - Creates subtle glow effect at press point
     * - Handles cleanup of animation elements
     * - Enhances user experience with responsive interactions
     * 
     * @param {HTMLElement} button - The button element being pressed
     */
    animateButton(button) {
      if (!button) return;
      
      // Add button-press class for animation
      button.classList.add('button-press');
      
      // Remove the class after animation completes
      setTimeout(() => {
        button.classList.remove('button-press');
      }, 300);
      
      // Add subtle glow effect
      const glowEffect = document.createElement('div');
      glowEffect.style.position = 'absolute';
      glowEffect.style.top = '0';
      glowEffect.style.left = '0';
      glowEffect.style.width = '100%';
      glowEffect.style.height = '100%';
      glowEffect.style.borderRadius = 'inherit';
      glowEffect.style.background = 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)';
      glowEffect.style.opacity = '0.5';
      glowEffect.style.pointerEvents = 'none';
      
      button.appendChild(glowEffect);
      
      // Fade out and remove the glow effect
      setTimeout(() => {
        glowEffect.style.transition = 'opacity 0.3s ease';
        glowEffect.style.opacity = '0';
        
        setTimeout(() => {
          if (button.contains(glowEffect)) {
            button.removeChild(glowEffect);
          }
        }, 300);
      }, 10);
    },
    
    /**
     * Create particle effects on button press
     * ==================================================
     * Generates interactive visual particle effects:
     * - Spawns floating particles around pressed buttons
     * - Randomizes particle direction, size, and count
     * - Handles particle lifecycle and cleanup
     * - Creates an engaging, responsive interface
     * - Emphasizes user interaction points
     * 
     * @param {Event} event - The button press event
     */
    createParticles(event) {
      if (!event || !event.target) return;
      
      const button = event.target.closest('.button');
      if (!button) return;
      
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Create 3-5 particles
      const particleCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position near the button
        const offsetX = Math.random() * 30 - 15;
        const offsetY = Math.random() * 20 - 10;
        
        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = (y + offsetY) + 'px';
        
        // Set random x-offset for animation
        particle.style.setProperty('--x-offset', (Math.random() * 100 - 50) + 'px');
        
        // Add to document
        document.body.appendChild(particle);
        
        // Start animation
        setTimeout(() => {
          particle.classList.add('particle-animation');
          
          // Remove particle after animation
          setTimeout(() => {
            if (document.body.contains(particle)) {
              document.body.removeChild(particle);
            }
          }, 2000);
        }, 10);
      }
    },
    
    /**
     * Create special particle effect when calculation is performed
     * ==================================================
     * Generates celebratory visual feedback for completed calculations:
     * - Creates larger number of particles around display
     * - Uses varied particle sizes and trajectories
     * - Implements staggered animation timing
     * - Provides satisfying completion feedback
     * - Enhances user engagement
     */
    createCalculationEffect() {
      const calculator = document.querySelector('.calculator');
      const rect = calculator.getBoundingClientRect();
      
      // Create a larger number of particles for calculation
      const particleCount = 15;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position around the display
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + rect.height * 0.3; // Around the display area
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Make some particles larger for variation
        const size = Math.random() * 4 + 3;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Set random x-offset for animation
        particle.style.setProperty('--x-offset', (Math.random() * 160 - 80) + 'px');
        
        // Add to document
        document.body.appendChild(particle);
        
        // Start animation with staggered timing
        setTimeout(() => {
          particle.classList.add('particle-animation');
          
          // Remove particle after animation
          setTimeout(() => {
            if (document.body.contains(particle)) {
              document.body.removeChild(particle);
            }
          }, 2000);
        }, Math.random() * 300);
      }
    },

    /**
     * Event Handling & Keyboard Support
     * ==================================================
     * Methods for managing user input and interactions:
     * - Keyboard event handling
     * - Touch event support
     * - Mobile device compatibility
     * - Input validation and processing
     * - Error handling and recovery
     */

    /**
     * Handle keyboard input for calculator operations
     * ==================================================
     * Processes keyboard events for calculator functionality:
     * - Maps keyboard keys to calculator operations
     * - Handles numeric input and operators
     * - Processes special function keys
     * - Provides immediate visual feedback
     * - Maintains calculator state consistency
     * 
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyPress(event) {
      const key = event.key;
      
      if (/[\d+\-*/.()%]/.test(key)) {
        this.press(key);
        return;
      }
      
      switch (key) {
        case 'Enter':
          event.preventDefault();
          this.calculate();
          break;
        case 'Escape':
          event.preventDefault();
          this.clear();
          break;
        case 'Backspace':
          event.preventDefault();
          this.backspace();
          break;
      }
    },

    /**
     * Initialization & Setup
     * ==================================================
     * Methods for initializing calculator functionality:
     * - Component lifecycle management
     * - Event listener setup
     * - Initial state configuration
     * - Mobile device optimization
     * - UI element initialization
     */

    /**
     * Called when the component is mounted to the DOM
     * ==================================================
     * Sets up initial calculator state and event listeners:
     * - Initializes keyboard event handling
     * - Configures mobile device support
     * - Sets up UI elements and animations
     * - Establishes initial calculator mode
     * - Prepares fraction calculation system
     */
    mounted() {
      // Add keyboard event listener
      window.addEventListener('keydown', this.handleKeyPress);
      
      // Prevent zooming on double tap (for mobile)
      document.addEventListener('touchend', function(event) {
        if (event.touches.length > 0) return;
        
        const now = Date.now();
        const lastTouch = this.lastTouch || now + 1;
        const delta = now - lastTouch;
        
        if (delta < 300 && delta > 0) {
          event.preventDefault();
        }
        
        this.lastTouch = now;
      }.bind(this), false);
      
      // Add grid overlay to the background
      const gridOverlay = document.createElement('div');
      gridOverlay.classList.add('grid-overlay');
      document.body.appendChild(gridOverlay);
      
      // Set initial calculator shape
      this.$nextTick(() => {
        const calculator = document.querySelector('.calculator');
        calculator.classList.add(this.isBasicMode ? 'basic-mode' : 'advanced-mode');
        
        // Make sure fractions are properly displayed
        // Test for 1/2 specifically by creating a simple fraction
        this.lastResult = 0.5;
        this.calculateFraction(0.5);
        if (this.fractionValue === '1/2') {
          console.log('Fraction calculation working correctly');
        }
      });
      
      // Add basic touch support
      this.$nextTick(() => {
        const buttons = document.querySelectorAll('.button');
        buttons.forEach(button => {
          // Add haptic feedback for mobile devices
          button.addEventListener('touchstart', () => {
            if (window.navigator && window.navigator.vibrate) {
              window.navigator.vibrate(25);
            }
          });
        });
      });
    },
    
    /**
     * Called before the component is destroyed
     * ==================================================
     * Performs cleanup operations before component removal:
     * - Removes event listeners
     * - Cleans up DOM elements
     * - Resets calculator state
     * - Prevents memory leaks
     * - Ensures proper cleanup
     */
    beforeDestroy() {
      // Remove event listener when component is destroyed
      window.removeEventListener('keydown', this.handleKeyPress);
    }
  },
  
  /**
   * Lifecycle Hooks
   * ==================================================
   * Functions that run at specific points in the Vue component lifecycle
   * Handle initialization, event binding, and cleanup
   * ==================================================
   */
  
  /**
   * Called when the component is mounted to the DOM
   * Sets up event listeners and initializes the calculator
   */
  mounted() {
    // Add keyboard event listener
    window.addEventListener('keydown', this.handleKeyPress);
    
    // Prevent zooming on double tap (for mobile)
    document.addEventListener('touchend', function(event) {
      if (event.touches.length > 0) return;
      
      const now = Date.now();
      const lastTouch = this.lastTouch || now + 1;
      const delta = now - lastTouch;
      
      if (delta < 300 && delta > 0) {
        event.preventDefault();
      }
      
      this.lastTouch = now;
    }.bind(this), false);
    
    // Add grid overlay to the background
    const gridOverlay = document.createElement('div');
    gridOverlay.classList.add('grid-overlay');
    document.body.appendChild(gridOverlay);
    
    // Set initial calculator shape
    this.$nextTick(() => {
      const calculator = document.querySelector('.calculator');
      calculator.classList.add(this.isBasicMode ? 'basic-mode' : 'advanced-mode');
      
      // Make sure fractions are properly displayed
      // Test for 1/2 specifically by creating a simple fraction
      this.lastResult = 0.5;
      this.calculateFraction(0.5);
      if (this.fractionValue === '1/2') {
        console.log('Fraction calculation working correctly');
      }
    });
    
    // Add basic touch support
    this.$nextTick(() => {
      const buttons = document.querySelectorAll('.button');
      buttons.forEach(button => {
        // Add haptic feedback for mobile devices
        button.addEventListener('touchstart', () => {
          if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(25);
          }
        });
      });
    });
  },
  
  /**
   * Called before the component is destroyed
   * Cleans up event listeners and resources
   */
  beforeDestroy() {
    // Remove event listener when component is destroyed
    window.removeEventListener('keydown', this.handleKeyPress);
  }
});