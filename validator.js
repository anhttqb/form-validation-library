function Validator(formSelector) {
    const _this = this;
    const formRules = {};
    function getParentElement(element, selector) {
        let parent = element.parentElement;
        // if parent doesn't have the selector, continue the loop to the next parent element
        while (parent && !parent.matches(selector)) {
            parent = parent.parentElement;
        }
        return parent;
    }

    /**
     * Quy uoc tao rule:
     * - If errors happen => return error message
     * - If no errors => return undefined
     */
    const validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này!';
        },
        email: function(value) {
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return emailRegex.test(value) ? undefined : 'Vui lòng nhập đúng định dạng email!';
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;
            }
        },
        confirm: function(value) {
            let pw = document.querySelector(formSelector + ' #password').value;
            return value === pw ? undefined : 'Mật khẩu nhập lại không chính xác';
        }
    };

    // Take the form element from DOM by using formSelector
    const formElement = document.querySelector(formSelector);
    // Only handle when there is a form element in the DOM
    if (formElement) {

        const inputs = formElement.querySelectorAll('[name][rules]');
        // console.log(inputs);
        inputs.forEach(input => {
            // check if the value of each rule is an array or not
            if (!Array.isArray(formRules[input.name])) {
                formRules[input.name] = [];
            }
            // Loop through each rule and assign its corresponding funciton to the formRules object
            input.getAttribute('rules').split('|').forEach(rule =>{
                const ruleHasValue = rule.includes(':');
                if (ruleHasValue) {
                    var ruleParts = rule.split(':');
                    rule = ruleParts[0];
                    console.log(validatorRules[rule](ruleParts[1]));
                }
                if (ruleHasValue) {
                    formRules[input.name].push(validatorRules[rule](ruleParts[1]));
                } else {
                    formRules[input.name].push(validatorRules[rule]);
                }
                // console.log(validatorRules[rule]);
            });

            // Listen events to validate (input, blur...)
            input.onblur = handleValidate;
            input.oninput = handleClearErrors;
        })
        console.log(formRules);
        // Function to handle validation
        function handleValidate(e) {
            const rules = formRules[e.target.name];
            // console.log(rules);
            let errorMessage;
            for (currentRule of rules) {
                // check if the input element is the radio or checkbox type
                switch (e.target.type) {
                    case 'checkbox':
                        errorMessage = currentRule(formElement.querySelector(`input[name="${e.target.name}"]` + ':checked'))
                        break;
                    case 'radio':
                        errorMessage = currentRule(formElement.querySelector(`input[name="${e.target.name}"]` + ':checked'))
                        break;
                    default:
                        errorMessage = currentRule(e.target.value);
                }
                if (errorMessage) break;
            }
            // If error happens, display the error message in the UI
            if (errorMessage) {
                let formGroup = getParentElement(e.target, '.form-group');
                if (formGroup) {
                    let formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerHTML = errorMessage;
                        formGroup.classList.add('invalid');
                    }
                }
            } 
            // if it has an error, return true
            return !!errorMessage;
        }
        // Function to clear error messages when user types the input
        function handleClearErrors(e) {
            let formGroup = getParentElement(e.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
                let formMessage = formGroup.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerHTML = '';
                }
            }
        }
    }

    // Handle submit form behavior
    formElement.onsubmit = (e) => {
        e.preventDefault();

        console.log(this);

        const inputs = formElement.querySelectorAll('[name][rules]');
        let isValid = true;
        for (currentInput of inputs) {
            // console.log(e.target);
            if (handleValidate({ target: currentInput })) {
                isValid = false;  
            }
        }
        // If no erros, then submit the form
        if (isValid) {
            if (typeof this.onSubmit === 'function') {
                const validInputs = formElement.querySelectorAll('[name]'); // select all all input fields with name and not disabled
                console.log(validInputs)
                // Turn the valid inputs into an array and using reduce to get the object of input's name key and its value.
                const formValues = Array.from(validInputs).reduce((values, input) => {
                    switch (input.type) {
                        case 'checkbox':
                            if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }
                            if (input.checked) {
                                values[input.name].push(input.value);
                            }
                            break;
                        case 'radio':
                            if (input.matches(':checked')) {
                                values[input.name] = input.value;
                            }
                            break;
                        case 'file':
                            values[input.name] = input.file;
                            break;
                        default:
                            values[input.name] = input.value;
                            break;
                    }
                    return values;
                }, {});
                this.onSubmit(formValues);
                return;
            }

            formElement.submit();
        }
    }
}