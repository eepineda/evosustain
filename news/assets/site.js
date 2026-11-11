const now = new Date();
const date = document.getElementById("today");
const year = document.getElementById("year");
if (date) date.textContent = now.toLocaleDateString("es-ES",{day:"numeric",month:"long",year:"numeric"});
if (year) year.textContent = now.getFullYear();
