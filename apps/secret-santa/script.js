document.addEventListener("DOMContentLoaded", () => {
    const participantForm = document.getElementById("participant-form");
    const participantList = document.getElementById("participant-list");
    const generatePairsButton = document.getElementById("generate-pairs");
    const statusMessages = document.getElementById("status-messages");
  
    const participants = [];
  
    // EmailJS
    emailjs.init("8AGnXOW-H-n9Ufakl");
  
    // Adaugă participant
    participantForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
  
      if (name && email) {
        participants.push({ name, email });
        participantList.innerHTML += `<li>${name} (${email})</li>`;
        participantForm.reset();
      }
    });
  
    // Generează perechi și trimite emailuri
    generatePairsButton.addEventListener("click", () => {
      if (participants.length < 2) {
        alert("Trebuie să adaugi cel puțin 2 participanți!");
        return;
      }
  
      clearStatusMessages(); // Curăță mesajele anterioare
  
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
  
      shuffled.forEach((giver, index) => {
        const receiver = shuffled[(index + 1) % shuffled.length];
  
        sendEmail(giver.email, giver.name, receiver.name)
          .then(() => {
            addStatusMessage(
              `Email trimis cu succes către ${giver.name} (${giver.email})!`,
              "success"
            );
          })
          .catch((error) => {
            addStatusMessage(
              `Eroare la trimiterea emailului către ${giver.name} (${giver.email}): ${error.message}`,
              "error"
            );
          });
      });
    });
  
    // Trimite email prin EmailJS
    function sendEmail(to, giverName, receiverName) {
      const templateParams = {
        to_name: giverName,
        to_email: to,
        receiver_name: receiverName,
      };
  
      return emailjs.send("service_tpa25u4", "template_njbew1g", templateParams);
    }
  
    // Afișează mesaj de status
    function addStatusMessage(message, type) {
      const messageElement = document.createElement("div");
      messageElement.className = `status-message ${type}`;
      messageElement.textContent = message;
      statusMessages.appendChild(messageElement);
    }
  
    // Curăță toate mesajele de status
    function clearStatusMessages() {
      statusMessages.innerHTML = "";
    }
  });
  