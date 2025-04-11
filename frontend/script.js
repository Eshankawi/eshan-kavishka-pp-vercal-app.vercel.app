document.getElementById('uploadButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('imageInput');
  if (fileInput.files.length === 0) {
    alert('Please select an image.');
    return;
  }

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  const response = await fetch('https://your-backend-url.com/upload', {
    method: 'POST',
    body: formData,
  });

  if (response.ok) {
    const data = await response.json();
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = `<img src="${data.qrCode}" alt="WhatsApp QR Code" />`;
  } else {
    alert('Failed to upload image and generate QR code.');
  }
});
