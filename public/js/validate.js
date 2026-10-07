// ======================================================
// 1. FIND THE CAMPGROUND FORM
// ======================================================

const form = document.querySelector("form.campground-form");

// If the form exists, run all validation code
if (form) {

    // ==================================================
    // 2. FUNCTION TO COUNT WORDS
    // ==================================================

    const countWords = (text) => {

        // Remove extra spaces from beginning and end
        text = text.trim();

        // Split the text wherever there is one or more spaces
        const wordArray = text.split(/\s+/);

        // Remove empty values
        const validWords = wordArray.filter(Boolean);

        // Return total number of words
        return validWords.length;
    };


    // ==================================================
    // 3. MAXIMUM IMAGE SIZE
    // ==================================================

    // 5 MB = 5 × 1024 × 1024 bytes
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;


    // ==================================================
    // 4. VALIDATION RULES
    // ==================================================

    // Each rule receives the value of a field.
    //
    // If the value is valid:
    //      return ""
    //
    // If the value is invalid:
    //      return an error message.

    const rules = {

        // ------------------------------------------------
        // TITLE VALIDATION
        // ------------------------------------------------

        title: (value) => {

            // Title must have at least 3 characters
            if (value.length < 3) {
                return "Title needs at least 3 characters";
            }

            // Title cannot have more than 40 characters
            if (value.length > 40) {
                return "Max 40 characters";
            }

            // No error
            return "";
        },


        // ------------------------------------------------
        // PRICE VALIDATION
        // ------------------------------------------------

        price: (value) => {

            // Price must be greater than 0
            if (!(value > 0)) {
                return "Enter a price above 0";
            }

            // Price cannot be greater than 1000
            if (value > 1000) {
                return "Max price is 1000";
            }

            // No error
            return "";
        },


        // ------------------------------------------------
        // LOCATION VALIDATION
        // ------------------------------------------------

        location: (value) => {

            // Location must have at least 3 characters
            if (value.length < 3) {
                return "Location needs at least 3 characters";
            }

            // Only allow:
            // Letters
            // Spaces
            // Commas
            // Periods
            // Apostrophes
            // Hyphens
            const locationPattern = /^[\p{L}\s,.'-]+$/u;

            if (!locationPattern.test(value)) {
                return "Use letters and commas only";
            }

            // No error
            return "";
        },


        // ------------------------------------------------
        // DESCRIPTION VALIDATION
        // ------------------------------------------------

        description: (value) => {

            // Count the words in the description
            const totalWords = countWords(value);

            // Minimum 10 words
            if (totalWords < 10) {
                return `${totalWords}/10 words minimum`;
            }

            // Maximum 60 words
            if (totalWords > 60) {
                return `${totalWords}/60 words maximum`;
            }

            // No error
            return "";
        },


        // ------------------------------------------------
        // IMAGE VALIDATION
        // ------------------------------------------------

        image: (file) => {

            // Make sure the selected file is an image
            if (!file.type.startsWith("image/")) {
                return "File must be an image";
            }

            // Image cannot be larger than 5 MB
            if (file.size > MAX_IMAGE_SIZE) {
                return "Max size is 5 MB";
            }

            // No error
            return "";
        }
    };


    // ==================================================
    // 5. CHECK ONE FIELD
    // ==================================================

    const checkField = (element) => {

        // Find the .form-group containing this input
        const field = element.closest(".form-group");

        // Find the message area inside that form-group
        const message = field.querySelector(".msg");


        // ----------------------------------------------
        // CHECK WHETHER THIS IS A FILE INPUT
        // ----------------------------------------------

        const isFileInput = element.type === "file";


        // Get the value entered by the user
        const value = element.value.trim();


        // ==================================================
        // SPECIAL CASE FOR EDIT PAGE IMAGE
        // ==================================================

        // On the edit page:
        //
        // User does NOT have to upload a new image.
        //
        // If the file input is empty and has data-optional,
        // we allow it because the old image will remain.

        if (
            isFileInput &&
            !value &&
            element.dataset.optional !== undefined
        ) {

            // Remove success/error styling
            field.classList.remove("is-ok");
            field.classList.remove("is-bad");

            // Show information message
            message.textContent =
                "Optional: leave empty to keep the current image";

            // Field is considered valid
            return true;
        }


        // ==================================================
        // CHECK WHETHER FIELD IS EMPTY
        // ==================================================

        let errorMessage = "";


        if (!value) {

            // Empty field
            errorMessage = "This field is required";

        } else {

            // ==================================================
            // RUN THE CORRECT VALIDATION RULE
            // ==================================================

            if (isFileInput) {

                // For image input, send the actual File object
                errorMessage = rules[element.name](element.files[0]);

            } else {

                // For normal inputs, send the text value
                errorMessage = rules[element.name](value);
            }
        }


        // ==================================================
        // UPDATE FIELD STYLING
        // ==================================================

        if (errorMessage) {

            // There is an error
            field.classList.add("is-bad");
            field.classList.remove("is-ok");

        } else {

            // No error
            field.classList.add("is-ok");
            field.classList.remove("is-bad");
        }


        // ==================================================
        // SHOW MESSAGE
        // ==================================================

        if (errorMessage) {

            message.textContent = errorMessage;

        } else {

            message.textContent = "Looks good ✓";
        }


        // ==================================================
        // RETURN WHETHER FIELD IS VALID
        // ==================================================

        if (errorMessage) {
            return false;
        }

        return true;
    };


    // ======================================================
    // 6. GET ALL FIELDS THAT HAVE VALIDATION RULES
    // ======================================================

    const fields = [...form.elements].filter((element) => {

        // Only keep elements that have a rule
        return rules[element.name];
    });


    // ======================================================
    // 7. ADD EVENTS TO EVERY FIELD
    // ======================================================

    fields.forEach((element) => {


        // --------------------------------------------------
        // CHECK WHILE USER IS TYPING
        // --------------------------------------------------

        element.addEventListener("input", () => {

            checkField(element);

        });


        // --------------------------------------------------
        // CHECK WHEN USER LEAVES THE FIELD
        // --------------------------------------------------

        element.addEventListener("blur", () => {

            checkField(element);

        });


        // --------------------------------------------------
        // CHECK PRE-FILLED VALUES
        // --------------------------------------------------

        // This is mainly useful on the edit page.
        //
        // Example:
        // Title already contains "Mountain Camp".
        //
        // We can validate it immediately.

        if (element.value) {

            checkField(element);

        }

    });


    // ======================================================
    // 8. CHECK THE ENTIRE FORM WHEN SUBMITTING
    // ======================================================

    form.addEventListener("submit", (event) => {


        // Assume that all fields are valid
        let formIsValid = true;


        // Check every field
        fields.forEach((element) => {

            const fieldIsValid = checkField(element);


            // If even one field is invalid,
            // the entire form becomes invalid.

            if (!fieldIsValid) {

                formIsValid = false;

            }

        });


        // ==================================================
        // IF FORM IS INVALID
        // ==================================================

        if (!formIsValid) {

            // Stop the form from being submitted
            event.preventDefault();


            // Find the first invalid input/textarea
            const firstBadField =
                form.querySelector(
                    ".is-bad input, .is-bad textarea"
                );


            // Focus it if it exists
            if (firstBadField) {

                firstBadField.focus();

            }

        }

    });

}