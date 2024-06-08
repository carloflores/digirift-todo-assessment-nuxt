export default defineNuxtRouteMiddleware((to) => {
    if (window.localStorage.getItem("jwt") == null ) return abortNavigation({ name: "login" });
});
