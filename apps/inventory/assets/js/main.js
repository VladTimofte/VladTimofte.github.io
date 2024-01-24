(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Sidebar toggle
   */
  if (select('.toggle-sidebar-btn')) {
    on('click', '.toggle-sidebar-btn', function(e) {
      select('body').classList.toggle('toggle-sidebar')
    })
  }

  /**
   * Search bar toggle
   */
  if (select('.search-bar-toggle')) {
    on('click', '.search-bar-toggle', function(e) {
      select('.search-bar').classList.toggle('search-bar-show')
    })
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }


  /**
   * Initiate Bootstrap validation check
   */
  const needsValidation = document.querySelectorAll('.needs-validation')

  Array.prototype.slice.call(needsValidation)
    .forEach(function(form) {
      form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })

  /**
   * Autoresize echart charts
   */
  const mainContainer = select('#main');
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function() {
        select('.echart', true).forEach(getEchart => {
          echarts.getInstanceByDom(getEchart).resize();
        })
      }).observe(mainContainer);
    }, 200);
  }

  retrieveData();
  // mobileInputValidator()

})();

function retrieveData(){

  const dataFromLS = localStorage?.getItem('inventoryTable')?.length ? JSON.parse(localStorage?.getItem('inventoryTable')) : [];

  if (dataFromLS?.length) {
    createTable(dataFromLS)
  } else {
    fetch('././data/fakeData.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                  createTable([])
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
              }
}

function createTable(data) {

  const table = document.getElementById("inventoryTable");

  // Loop through each row starting from the last one in order to delete every previous row
  for (let i = table.rows.length - 1; i > 0; i--) {
    // Delete the row
    table.deleteRow(i);
  }

  if (data.length) {
    for (let i = 0; i < data.length; i++) {
      const newRow = table.insertRow(table.rows.length);
      newRow.classList.add("pointer");
      newRow.classList.add("bkg-gray");

      // Example: add two cells with content
      const productName = newRow.insertCell(0);
      const totalPrice = newRow.insertCell(1);
    
      productName.innerHTML = data[i].productName;
      totalPrice.innerHTML = `${data[i].totalPrice} RON`;

      // Add a specific class to the totalPrice td
      totalPrice.classList.add("text-align-end");

      // Attach a custom function to the row (replace yourCustomFunction with your actual function)
      newRow.addEventListener("click", function() {
        handleModalWhenEditingExistingProduct(data[i]); // Pass the data for the clicked row to your custom function
      });
    }
    
    // Add new row for Total Calculation for products
    const totalRow = table.insertRow(table.rows.length);
    totalRow.classList.add("total-table-row");
    
    const totalText = totalRow.insertCell(0);
    const totalPrice = totalRow.insertCell(1);

    totalText.innerHTML = 'TOTAL';
    totalPrice.innerHTML = getTotalPriceOfAllProducts(data) + ' RON';

    totalPrice.classList.add("text-align-end");
  }
  handleContentFound();
}

function generateID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';

  for (let i = 0; i < 22; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomId += characters.charAt(randomIndex);
  }

  return randomId;
}

function addOrSaveProduct() {

  const productID = document.getElementById('productID').value;
  const productName = document.getElementById('productName').value;
  const unitPrice = parseFloat(document.getElementById('unitPrice').value);
  const sku = parseFloat(document.getElementById('sku').value);
  const totalPrice = parseFloat(document.getElementById('totalPrice').value);



  // Call your custom function with form field values
  const createdDataObj = {
    id: productID || generateID(),
    productName,
    sku,
    unitPrice,
    totalPrice: parseFloat((unitPrice * sku).toFixed(2))
  }
  addOrUpdateObjectById(createdDataObj);

  // Prepare the Modal for a new product
  resetForm();
  focusOnProductName();
  refreshTable();
}

function addOrUpdateObjectById(updatedObject) {
  // Retrieve the existing array from local storage
  const existingArray = localStorage?.getItem('inventoryTable')?.length ? JSON.parse(localStorage?.getItem('inventoryTable')) : [];

  // Find the index of the object with the specified ID
  const index = existingArray.findIndex(obj => obj.id === updatedObject.id);

  if (index !== -1) {

      // Object with the specified ID exists, replace it
      existingArray[index] = updatedObject;
      localStorage.setItem('inventoryTable', JSON.stringify(existingArray));
      closeModal();

  } else {
      const newProductModalTitle = document.getElementById('newProductModalTitle');

      // Object with the specified ID does not exist, add it to the array
      existingArray.push(updatedObject);
      localStorage.setItem('inventoryTable', JSON.stringify(existingArray));
      displaySuccessfulMessage();
      newProductModalTitle.innerHTML = 'Adaugă următorul produs'
  }
}

function resetForm() {
  // Get the form element
  const form = document.getElementById('addProductForm');

  // Reset the form fields to their default values
  form.reset();
}

function displaySuccessfulMessage() {
  const msgElement = document.getElementById('newProductSuccesMessage');
  const modalTitle = document.getElementById('newProductModalTitle');
  
  modalTitle.style.display = 'none';
  msgElement.style.display = 'block';

  setTimeout(function () {
    modalTitle.style.display = 'block';
    msgElement.style.display = 'none';
}, 2000);
}

function refreshTable() {
  const dataFromLS = localStorage?.getItem('inventoryTable')?.length ? JSON.parse(localStorage?.getItem('inventoryTable')) : [];
  const input = document.getElementById('searchBarTableProducts').value;

  if (input?.length) {
    searchTable()
  } else {
    createTable(dataFromLS)
  }
}

function handleModalWhenEditingExistingProduct(data) {
  openModal()
  const newProductModalTitle = document.getElementById('newProductModalTitle');
  const deleteProductByIdBTN = document.getElementById('deleteProductByIdBTN');

  const productNameInput = document.getElementById('productName');
  const unitPriceInput = document.getElementById('unitPrice');
  const skuInput = document.getElementById('sku');
  const productID = document.getElementById('productID');
  const totalPrice = document.getElementById('totalPrice');

  productNameInput.value = data?.productName
  unitPriceInput.value = data?.unitPrice
  skuInput.value = data?.sku
  productID.value = data?.id
  totalPrice.value = data?.totalPrice

  newProductModalTitle.innerHTML = 'Detalii produs'
  deleteProductByIdBTN.style.display = 'flex'
  deleteProductByIdBTN.onclick = () => deleteSingleProductConfirmation(data?.id);
}

function showCleanModal() {
    // Get the form element
    const newProductModalTitle = document.getElementById('newProductModalTitle');
    const deleteProductByIdBTN = document.getElementById('deleteProductByIdBTN');

    // Reset the form fields to their default values
    resetForm()
    openModal()

  newProductModalTitle.innerHTML = 'Produs Nou'
  deleteProductByIdBTN.style.display = 'none'
}

function confirmDeleteAllProducts() {
  const deleteTXT = document.getElementById('deleteAllProductsTxt');
  const deleteBtn = document.getElementById('deleteAllProductsBtnID');
  deleteTXT.innerHTML = 'Ești sigur/ă?'
  deleteBtn.disabled = true;
  const seconds = 5;

  for (let i = seconds; i >= 0; i--) {
    // Use setTimeout to introduce a 1-second delay
    setTimeout(function () {
      
      if (i === 0) {
        deleteTXT.innerHTML = 'Ești sigur/ă?'
        deleteBtn.disabled = false;
        deleteBtn.onclick = deleteAllProducts;
      }else {
        deleteTXT.innerHTML = 'Ești sigur/ă? (' + i + ')' 
      }
    }, (seconds - i) * 750); // i * 1000 milliseconds = 1 second
  }

  setTimeout(function () {
    deleteTXT.innerHTML = 'Șterge toate produsele'
    deleteBtn.disabled = false;
    deleteBtn.onclick = confirmDeleteAllProducts;
    }, (seconds * 1000) + 1500 );

}

function deleteAllProducts() {
  localStorage.setItem('inventoryTable', []);
  refreshTable();
}

function handleContentFound() {
  const entireInventoryList = document.getElementById('entireInventoryList')
  const noPorductsSectionTxt = document.getElementById('noPorductsSectionTxt')

  const dataFromLS = localStorage?.getItem('inventoryTable')?.length ? JSON.parse(localStorage?.getItem('inventoryTable')) : [];

  if (!dataFromLS?.length) {
    entireInventoryList.style.display = 'none';
    noPorductsSectionTxt.style.display = 'block';
  } else {
    entireInventoryList.style.display = 'block';
    noPorductsSectionTxt.style.display = 'none';
  }
}

function openModal() {
  var modal = document.getElementById("productModalID");
  modal.style.display = "flex"; // Set display to flex to trigger the transition
  setTimeout(function() {
      modal.classList.add("show");
  }, 10); // Add a small delay to ensure the transition takes effect
}

function closeModal() {
  var modal = document.getElementById("productModalID");
  modal.classList.remove("show");
  
   // Add a delay before hiding the modal to allow the fade-out animation to play
   setTimeout(function() {
    modal.style.display = "none";
}, 300); // 300 milliseconds matches the transition duration in CSS
}

function focusOnProductName() {
  var productNameInput = document.getElementById("productName");
  if (productNameInput) {
      productNameInput.focus();
  }
}

// function mobileInputValidator() {
//   // iOS detection from: stackoverflow.com/a/9039885 with explanation about MSStream
// if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
// {
//     var inputs = document.querySelectorAll('input[type="number"]');
//     for(var i = inputs.length; i--;)
//         inputs[i].setAttribute('pattern', '\\d*');
// }
// }

function deleteProductByID(e, id) {
  e.preventDefault();
  // Retrieve the array from localStorage
  let dataFromLS = localStorage?.getItem('inventoryTable')?.length ? JSON.parse(localStorage?.getItem('inventoryTable')) : [];

  // Check if the array exists in localStorage
  if (dataFromLS?.length) {

    // Find the index of the object with the given ID
    const filteredData = dataFromLS.filter(obj => obj.id !== id);

    // Check if the object with the given ID was found
    if (filteredData?.length !== dataFromLS?.length) {

      // Save the updated array back to localStorage
      localStorage.setItem('inventoryTable', JSON.stringify(cloneArray(filteredData)));

      console.log(`Object with ID ${id} deleted successfully.`);
      refreshTable();
      closeModal();
    } else {
      console.log(`Object with ID ${id} not found.`);
    }
  } else {
    console.log('No data found in localStorage.');
  }
}

function cloneArray(originalArray) {
  return [...originalArray];
}

function deleteSingleProductConfirmation(id) {
  const deleteSingleProductTXT = document.getElementById('deleteSingleProduct');
  const deleteProductByIdBTN = document.getElementById('deleteProductByIdBTN');
  deleteSingleProductTXT.innerHTML = 'Ești sigur/ă?'
  deleteProductByIdBTN.disabled = true;
  const seconds = 2;

  for (let i = seconds; i >= 0; i--) {
    // Use setTimeout to introduce a 1-second delay
    setTimeout(function () {
      
      if (i === 0) {
        deleteSingleProductTXT.innerHTML = 'Ești sigur/ă?'
        deleteProductByIdBTN.disabled = false;
        deleteProductByIdBTN.onclick = (event) => deleteProductByID(event, id);
      }else {
        deleteSingleProductTXT.innerHTML = 'Ești sigur/ă? (' + i + ')' 
      }
    }, (seconds - i) * 500); // i * 1000 milliseconds = 1 second
  }

  setTimeout(function () {
    deleteSingleProductTXT.innerHTML = 'Șterge produs'
    deleteProductByIdBTN.disabled = false;
    deleteProductByIdBTN.onclick = () => deleteSingleProductConfirmation(id);
    }, (seconds * 1000) + 1500 );
}

function generatePDF(nameTXT) {
  // Get input element and filter value
    const searchInput = document.getElementById('searchBarTableProducts').value;

  // Create a new iFrame
  const iFrame = document.createElement('iframe');
  iFrame.style.display = 'none';
  document.body.appendChild(iFrame);

  // Get table data (replace this with your own data)
  const dataFromLS = localStorage?.getItem('inventoryTable')?.length ? JSON.parse(localStorage?.getItem('inventoryTable')) : [];

   // Generate table HTML
   const dataToBeDownloaded = !searchInput?.length ? dataFromLS : filterDataBasedOnInputSearch();
   const tableHtml = generateTableHtml(dataToBeDownloaded, nameTXT);

  // Set iFrame content
  iFrame.contentDocument.body.innerHTML = tableHtml;

  // Print the iFrame content
  iFrame.contentWindow.print();

  // Clean up: remove the iFrame after printing
  setTimeout(() => {
      document.body.removeChild(iFrame);
  }, 1000); // Adjust the delay as needed
}

function generateTableHtml(data, nameTXT) {
  let tableHtml = '<div style="text-align: start; margin-top: 20px !important;">';
  const dataWithoutID = data.map(obj => {
    // Use object destructuring to remove the 'id' key
    const { id, ...rest } = obj;
    return rest;
  });
  
  // Add custom title
  tableHtml += `<h2>${nameTXT}</h2>`;

  // Add table with centered style
  tableHtml += '<table style="margin: 0 auto; width: 100%; border-collapse: collapse;">';

  // Add table header
  tableHtml += '<tr>';
  Object.keys(dataWithoutID[0]).forEach(key => {
    // Fix the condition here
    console.log(key)
    tableHtml += `<th style="padding: 40px 0 30px 0; text-align: ${key === 'productName' ? 'start' : 'center'}; border-bottom: solid 1px black;">${translateWord(key)}</th>`;
  });
  tableHtml += '</tr>';

  // Add table rows
  dataWithoutID.forEach(row => {
    tableHtml += '<tr>';
    Object.values(row).forEach((value, i) => {
      tableHtml += `<td style="padding: 4px; text-align: ${i === 0 ? 'start' : 'center'}; border-bottom: solid 1px gray; font-size: 14px;">${value}</td>`;
    });
    tableHtml += '</tr>';
  });    

  // Add custom row (TOTAL)
  const customRowValues = { productName: 'TOTAL', sku: '', unitPrice: '', totalPrice: getTotalPriceOfAllProducts(data) }; 
  tableHtml += '<tr>';
  Object.values(customRowValues).forEach(value => {
    tableHtml += `<td style="padding: 30px 0 0 0; text-align: ${value === 'TOTAL' ? 'start' : 'center'}; font-weight: 600">${value}</td>`;
  });
  tableHtml += '</tr>';

  tableHtml += '</table>';
  tableHtml += '</div>';
  return tableHtml;
}

function getTotalPriceOfAllProducts(data) {
  const calculatedNumber = data.reduce(function (acc, obj) {
    return acc + parseFloat(obj.totalPrice);
  }, 0);
  return parseFloat(calculatedNumber)?.toFixed(2);
}

function unitPriceInput(input) {
   // Remove any non-numeric and non-dot characters
   let sanitizedInput = input.value.replace(/[^\d.]/g, '');

   // Replace consecutive dots with a single dot
   sanitizedInput = sanitizedInput.replace(/(\.\.+)/g, '.');
 
   // Ensure only one dot is present and limit decimals to 2
   const parts = sanitizedInput.split('.');
   if (parts.length > 1) {
     // Combine integer part and decimal part with at most 2 decimal places
     sanitizedInput = parts[0] + '.' + parts[1].slice(0, 2);
   }
 
   // Update the input value with the sanitized value
   input.value = sanitizedInput;

}

function quantityProductInput(input) {
  // Remove any non-numeric characters
  let sanitizedInput = input.value.replace(/\D/g, '');

  // Update the input value with the sanitized value
  input.value = sanitizedInput;
}

function translateWord(word) {
  const listOfWords = { productName: "Nume produs", sku: "Cantitate", unitPrice: "Preț / produs", totalPrice: "Preț Total" }
  return listOfWords[word] || "Title"
}

function searchTable() {

const filteredData = filterDataBasedOnInputSearch();

 createTable(filteredData);

}

function onInputSearchTable() {
   //LS
   const dataFromLS = localStorage?.getItem('inventoryTable')?.length ? JSON.parse(localStorage?.getItem('inventoryTable')) : [];
  
   // Get input element and filter value
   const input = document.getElementById('searchBarTableProducts').value;
 
   if (!input || !Array.isArray(dataFromLS)) {
     createTable(dataFromLS);
   }
   
}

function filterDataBasedOnInputSearch() {
    //LS
    const dataFromLS = localStorage?.getItem('inventoryTable')?.length ? JSON.parse(localStorage?.getItem('inventoryTable')) : [];
  
  // Get input element and filter value
  const input = document.getElementById('searchBarTableProducts').value;

  searchString = input.toLowerCase();

  return dataFromLS.filter((obj) => {
    const productNameIncludes = obj.productName.toLowerCase().includes(searchString);
    const totalPriceIncludes = obj.totalPrice.toString().includes(searchString);

    return productNameIncludes || totalPriceIncludes;
  });

}

function askForPDFFileName() {
  const userInput = window.prompt("Introdu numele PDF-ului după care dorești să descarci: ");

  if (userInput !== null) {
      generatePDF(userInput);
  }
}