document.getElementById('fileInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('preview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function login() {
  const number = document.getElementById('whatsappNumber').value;
  if (number.trim() === '') {
    alert('Please enter your WhatsApp number.');
    return;
  }
  alert(`Logging in for WhatsApp number: ${number}`);
  // Here you'd send data to backend to automate Puppeteer login
}
