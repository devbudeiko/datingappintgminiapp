document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("multi-step-form");
    const steps = document.querySelectorAll(".form-step");
    const formNavigation = document.querySelector(".form-navigation");
    const formContainer = document.querySelector(".form-container");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const finishBtn = document.getElementById("finishBtn");
    const progressBar = document.querySelector(".progress");
    const progressText = document.getElementById("progress-text");
    const notification = document.getElementById("notification");
    const successMessage = document.querySelector(".form-success");
    let currentStep = 0;
    const MAX_FILE_SIZE = 30 * 1024 * 1024;
    const ACCEPTED_FILE_FORMATS = ["image/jpeg", "image/png", "image/jpg"];

    if (!nextBtn || !finishBtn) {
        return;
    }

    notification.classList.add("hidden");

    const nameInput = document.querySelector(".js-registration-form-name");
    nameInput.addEventListener("input", function () {
        var regex = /^[А-Яа-яA-Za-z]*$/;
        var inputText = this.value;
        if (!regex.test(inputText)) {
            this.value = inputText.slice(0, -1);
        }
    });

    const textInput = document.querySelector(".js-registration-form-text");
    textInput.addEventListener("input", function () {
        var regex = /^[А-Яа-яA-Za-z0-9_,.\s]*$/;
        var inputText = this.value;

        if (inputText.length > 120) {
            this.value = inputText.slice(0, 120);
            return;
        }

        if (!regex.test(inputText)) {
            this.value = inputText.replace(/[^А-Яа-яA-Za-z0-9_,.\s]/g, "");
        }
    });

    textInput.addEventListener("focus", () => {
        document.body.style.zoom = "1";
    });

    function updateForm() {
        steps.forEach((step) => {
            step.style.display = "none";
        });

        steps[currentStep].style.display = "block";

        progressText.textContent = `${currentStep + 1} / ${steps.length}`;
        progressBar.style.width = `${
            ((currentStep + 1) / steps.length) * 100
        }%`;

        prevBtn.style.display = "inline-block";

        if (currentStep === 0) {
            prevBtn.disabled = true;
            prevBtn.classList.remove("active");
        } else {
            prevBtn.disabled = false;
            prevBtn.classList.add("active");
        }

        if (currentStep === steps.length - 1) {
            nextBtn.style.display = "none";
            finishBtn.style.display = "inline-block";
        } else {
            nextBtn.style.display = "inline-block";
            finishBtn.style.display = "none";
        }
    }

    function validateStep(step) {
        const inputs = step.querySelectorAll(
            'input[required], select[required], input[type="radio"]'
        );
        let valid = true;

        inputs.forEach((input) => {
            if (input.type === "radio") {
                const name = input.name;
                const checkedRadio = step.querySelector(
                    `input[name="${name}"]:checked`
                );
                if (!checkedRadio) {
                    valid = false;
                }
            } else if (input.tagName === "SELECT") {
                if (!input.value) {
                    valid = false;
                }
            } else if (!input.value) {
                valid = false;
            } else if (input.type === "file") {
                const file = input.files[0];
                if (
                    file &&
                    (file.size > MAX_FILE_SIZE ||
                        !ACCEPTED_FILE_FORMATS.includes(file.type))
                ) {
                    valid = false;
                }
            }
        });

        return valid;
    }

    nextBtn.addEventListener("click", function () {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
        if (validateStep(steps[currentStep])) {
            if (currentStep < steps.length - 1) {
                currentStep++;
                updateForm();
            }
        } else {
            notification.innerText =
                "Заполните все обязательные поля перед переходом к следующему шагу!";
            notification.classList.add("show");
            notification.classList.remove("hidden");

            setTimeout(function () {
                notification.classList.remove("show");
                notification.classList.add("hidden");
            }, 4000);
        }
    });

    prevBtn.addEventListener("click", function () {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
        if (currentStep > 0) {
            currentStep--;
            updateForm();
        }
    });

    updateForm();

    document.addEventListener("click", function (event) {
        const activeElement = document.activeElement;
        if (
            activeElement.tagName === "INPUT" &&
            !activeElement.contains(event.target)
        ) {
            activeElement.blur();
        }
    });

    function handleFileInputChange(input, previewImg, icon, uploader) {
        input.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                if (
                    file.size > MAX_FILE_SIZE ||
                    !ACCEPTED_FILE_FORMATS.includes(file.type)
                ) {
                    notification.innerText =
                        "Размер файла должен быть меньше 30 МБ и в формате JPG, JPEG или PNG.";
                    notification.classList.add("show");
                    notification.classList.remove("hidden");

                    setTimeout(function () {
                        notification.classList.remove("show");
                        notification.classList.add("hidden");
                    }, 4000);
                    input.value = "";
                    previewImg.style.display = "none";
                    previewImg.src = "";
                    uploader.classList.remove("uploaded");
                } else {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        icon.style.display = "none";
                        previewImg.src = e.target.result;
                        previewImg.style.display = "block";
                        uploader.classList.add("uploaded");
                    };
                    reader.readAsDataURL(file);
                }
            } else {
                previewImg.style.display = "none";
                previewImg.src = "";
                uploader.classList.remove("uploaded");
            }
        });
    }

    const profileImageInput = document.getElementById("profileImageInput");
    const profileImagePreview = document.getElementById("profileImagePreview");
    const uploaderIconProfile = document.querySelector(
        ".js-icon-uploader-profile"
    );
    const profileUploader = document.getElementById("profileUploader");

    if (profileImageInput) {
        handleFileInputChange(
            profileImageInput,
            profileImagePreview,
            uploaderIconProfile,
            profileUploader
        );
    }

    const image1Input = document.getElementById("image1Input");
    const image2Input = document.getElementById("image2Input");
    const imagePreviewOne = document.getElementById("image1Preview");
    const uploaderIconPlus = document.querySelector(".camera-icon-1");
    const uploaderOne = document.getElementById("uploader1");
    const imagePreviewTwo = document.getElementById("image2Preview");
    const uploaderIconCamera = document.querySelector(".camera-icon-2");
    const uploaderTwo = document.getElementById("uploader2");

    if (image1Input) {
        handleFileInputChange(
            image1Input,
            imagePreviewOne,
            uploaderIconPlus,
            uploaderOne
        );
    }

    if (image2Input) {
        handleFileInputChange(
            image2Input,
            imagePreviewTwo,
            uploaderIconCamera,
            uploaderTwo
        );
    }

    finishBtn.addEventListener("click", function (event) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
        event.preventDefault(); // Предотвращаем стандартную отправку формы

        const preloader = document.querySelector(".image-preloader");
        preloader.classList.remove("hide");

        const name = document.querySelector(".js-registration-form-name").value;
        const age = document.querySelector(".js-registration-age-value").value;
        const city = document.querySelector(
            ".js-registration-city-value"
        ).value;
        const text = document.querySelector(".js-registration-form-text").value;
        const gender = document.querySelector(
            'input[name="gender"]:checked'
        ).value;
        const genderCategory = document.querySelector(
            'input[name="gender-category"]:checked'
        ).value;

        // Получаем данные пользователя Telegram из скрытых полей
        const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
        const userName = window.Telegram.WebApp.initDataUnsafe.user.username;

        const profileImage =
            document.querySelector("#profileImageInput").files[0];

        // Подготавливаем данные для отправки на сервер
        const formData = new FormData();
        formData.append("name", name);
        formData.append("age", age);
        formData.append("city", city);
        formData.append("tg_user_id", userId);
        formData.append("tg_user_username", userName);
        formData.append("text", text);
        formData.append("gender", gender);
        formData.append("gender_category", genderCategory);
        formData.append("profileImage", profileImage);

        // Отправляем данные на сервер с помощью fetch
        fetch("/register", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    // Скрываем форму и показываем сообщение об успешной регистрации
                    form.style.display = "none";
                    formNavigation.style.display = "none";
                    formContainer.style.background = "none";
                    formContainer.style.boxShadow = "none";
                    document.querySelector(
                        ".js-top-img-registration"
                    ).style.display = "none";
                    document.querySelector(
                        ".js-top-img-registration-success"
                    ).style.display = "block";
                    successMessage.style.display = "block";
                    preloader.classList.add("hide");
                } else {
                    return response.text().then((text) => {
                        throw new Error(text);
                    });
                }
            })
            .catch((error) => {
                console.log(error);

                preloader.classList.add("hide");

                alert(
                    "Не удалось сохранить данные. Пожалуйста, попробуйте еще раз."
                );
            });
    });
});
