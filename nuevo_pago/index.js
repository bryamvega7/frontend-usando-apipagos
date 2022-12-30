const logoutButton = document.querySelector('.logout-button');
logoutButton.addEventListener('click', function() {
  removeLocalStorage();
  GetService();
});

const formulario = document.querySelector("#formulario-pagos");

formulario.addEventListener('submit', (event) => {
  event.preventDefault();
  paymentData();
});

async function GetService() {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch(
        "https://apipagos-production.up.railway.app/users/api/v2/service/",
        {
            headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
            }),
        }
    );
    const services = await response.json();
    
    // Llamada a la función ServicesMenu
    ServicesMenu(services.results);
    } catch (error) {
    console.log(error);
    RefreshToken();
    }
}


async function paymentData() {
    const expDate = formulario.elements.expDate;
    const services = formulario.elements.services;
    const monto = formulario.elements.monto;
    const msgFecha = document.querySelector("#msgFecha");
    const msg1 = document.querySelector("#msg1");
    const msg2 = document.querySelector("#msg2");
  
    //console.log(services);

    let formValidation = () => {
      if (expDate.value === "") {
        msgFecha.classList.remove("d-none");
      }
      if(services.value === ""){
        msg1.classList.remove("d-none");
      }
  
      if(monto.value === ""){
        msg2.classList.remove("d-none");
      }
  
  
      if (expDate.value !== "" && services.value !== "" && monto.value !==""){
        msgFecha.classList.add("d-none");
        msg1.classList.add("d-none");
        msg2.classList.add("d-none");
        return true;
      }
  
      return false;
    }
  
    if (!formValidation()) {
      return;
    }
  
    // Obtener el nombre del servicio seleccionado
    const idServicio = formulario.elements.services.value;
    const sessionId = localStorage.getItem('id');


    const data = {
        user_id: sessionId,
        service_id: idServicio,
        amount: monto.value,
        expirationDate: expDate.value,
    };
    //console.log(data);

    const accessToken = localStorage.getItem("access_token");

    await fetch("https://apipagos-production.up.railway.app/users/api/v2/payment/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        body: JSON.stringify(data)
    }).then((response)=>{
        if (response.ok){
            Swal.fire(
                '¡Creado!',
                'Los datos se guardaron correctamente',
                'success'
              ).then((result) => {
                if (result.isConfirmed) {
                    window.location.replace("../pagos/index.html");
                }
            }) 
        }
        else{
            Swal.fire({
                icon:"error",
                title: 'Oops...',
                text: "¡Ocurrió un error!!!"
            })         
        }
    })
}



// Función para añadir los servicios al select en el HTML
function ServicesMenu(services) {
    // Obtén el elemento select del HTML
    const select = document.querySelector('#services');

    // Recorre el array de servicios
    services.forEach((service) => {
    // Crea una nueva opción para el select
    const option = document.createElement('option');

    // Asigna el valor y el texto de la opción
    option.value = service.id_services; // puedes usar cualquier valor que quieras para el value de la opción
    option.text = service.name;

    // Añade la opción al select
    select.appendChild(option);
  });
}


async function RefreshToken() {
    const refreshToken = localStorage.getItem("refresh_token");
  
    const response = await fetch("https://apipagos-production.up.railway.app/users/jwt/refresh/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            refresh: refreshToken,
        }),
    });
  
    const data = await response.json();
  
    if (data.access) {
      localStorage.setItem("access_token", data.access);
    } else {
      window.location.href = "/login";
    }
  }


function removeLocalStorage(){
  localStorage.clear();
}

window.addEventListener("load", RefreshToken);
GetService();