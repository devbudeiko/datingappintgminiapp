import { addGlobalEventHandlers } from "../modules/eventHandlers.js";

document.addEventListener("DOMContentLoaded", async () => {
    addGlobalEventHandlers();

    const platform = Telegram ? Telegram.WebApp.platform : "webapp";
    if (
        !["ios", "android", "android_x"].includes(platform) &&
        window.location.pathname !== "/403"
    ) {
        window.location.href = "/403";
    }

    const userName = window.Telegram.WebApp.initDataUnsafe.user.username;
    if (userName == undefined && window.location.pathname !== "/not-username") {
        window.location.href = "/not-username";
    }

    if (window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${value};${expires};path=/;Secure;SameSite=Strict;`;
    }

    setCookie("initData", window.Telegram.WebApp.initData, 1);

    window.fetchData = async function fetchData(path, method, body) {
        const baseUrl = "https://wondy.online/";
        try {
            const options = {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "same-origin",
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(baseUrl + path, options);

            console.log("fetchData response", response);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.statusText} - ${errorText}`);
            }

            return response.json();
        } catch (e) {
            console.error("Fetch error:", e);
            throw new Error(`Fetch failed: ${e.message}`);
        }
    };

    window.redirect = function redirect(url) {
        if (window.location.pathname !== url) {
            window.location.href = url;
        }
    };

    window.checkUserRegistration = async function checkUserRegistration(
        redirectParams
    ) {
        console.log("checkUser", redirectParams);

        try {
            const result = await fetchData("checkUserInitData", "POST");

            console.log(redirectParams, result);

            if (result.exists) {
                window.redirect(redirectParams.redirectOnSuccess);
            } else {
                window.redirect(redirectParams.redirectOnFailure);
            }
        } catch (e) {
            window.redirect("/");
        }
    };

    const checkRegistrationAndRedirectWithPreloader = async (
        successPath,
        failurePath
    ) => {
        document.getElementById("preloader").classList.remove("hide");
        await window.checkUserRegistration({
            redirectOnSuccess: successPath,
            redirectOnFailure: failurePath,
        });
        document.getElementById("preloader").classList.add("hide");
    };

    if (window.location.pathname === "/") {
        await checkRegistrationAndRedirectWithPreloader("/dating", "/");
    }
    if (window.location.pathname === "/dating") {
        await window.checkUserRegistration({
            redirectOnSuccess: "/dating",
            redirectOnFailure: "/",
        });
    }
    if (window.location.pathname === "/settings") {
        await window.checkUserRegistration({
            redirectOnSuccess: "/settings",
            redirectOnFailure: "/",
        });
    }
    if (window.location.pathname === "/likes") {
        await window.checkUserRegistration({
            redirectOnSuccess: "/likes",
            redirectOnFailure: "/",
        });
    }
});
