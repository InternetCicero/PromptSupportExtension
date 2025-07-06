document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const backButton = document.getElementById("backButton");

  // Dark Mode Zustand aus localStorage laden
  const darkMode = localStorage.getItem("darkMode") === "true";
  darkModeToggle.checked = darkMode;
  if (darkMode) {
    document.body.classList.add("dark");
  }

  // Dark Mode Umschalten
  darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  });

  // Zurück Button Funktionalität
  backButton.addEventListener("click", () => {
    window.location.href = "popup.html"; // Hier ggf. anpassen
  });
});
