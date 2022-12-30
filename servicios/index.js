const logoutButton = document.querySelector('.logout-button');
logoutButton.addEventListener('click', function() {
  removeLocalStorage();
  GetService();
});

const formularioAdd = document.querySelector("#formulario-addservicios");
const formularioMod = document.querySelector("#formulario-modservicios");

formularioAdd.addEventListener('submit', (event) => {
    event.preventDefault();
    serviceAddData();
});

formularioMod.addEventListener('submit', (event) => {
    event.preventDefault();
    serviceModData();
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
      const service = await response.json();

      ServicesMenu(service.results);
    } catch (error) {
      console.log(error);
      RefreshToken();
    }
  }


async function serviceAddData() {
    const name = formularioAdd.elements.name;
    const description = formularioAdd.elements.description;
    const logo = formularioAdd.elements.logo;
    const msgAddName = document.querySelector("#msgAddName");
    const msgAddDescription = document.querySelector("#msgAddDescription");
    const msgAddUrl = document.querySelector("#msgAddUrl");
  
    let formAddValidation = () => {
      if (name.value === "") {
        msgAddName.classList.remove("d-none");
      }
      if(description.value === ""){
        msgAddDescription.classList.remove("d-none");
      }
  
      if(logo.value === ""){
        msgAddUrl.classList.remove("d-none");
      }
  
  
      if (name.value !== "" && description.value !== "" && logo.value !==""){
        msgAddName.classList.add("d-none");
        msgAddDescription.classList.add("d-none");
        msgAddUrl.classList.add("d-none");
        return true;
      }
  
      return false;
    }
  
    if (!formAddValidation()) {
      return;
    }
  
    const data = {
        name: name.value,
        description: description.value,
        logo: logo.value,
        //author: 1
    };
    
    console.log(data)

    const accessToken = localStorage.getItem("access_token");

    await fetch("https://apipagos-production.up.railway.app/users/api/v2/service/", {
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


async function serviceModData() {
  
  const idServicio = formularioMod.elements.services.value;
  const name = formularioMod.elements.name;
  const description = formularioMod.elements.description;
  const logo = formularioMod.elements.logo;
  const msgModName = document.querySelector("#msgModName");
  const msgModDescription = document.querySelector("#msgModDescription");
  const msgModUrl = document.querySelector("#msgModUrl");

  console.log(idServicio);
  console.log(name);
  console.log(description);
  console.log(logo);


  let formModValidation = () => {
    if (name.value === "") {
      msgModName.classList.remove("d-none");
    }
    if(description.value === ""){
      msgModDescription.classList.remove("d-none");
    }

    if(logo.value === ""){
      msgModUrl.classList.remove("d-none");
    }


    if (name.value !== "" && description.value !== "" && logo.value !==""){
      msgModName.classList.add("d-none");
      msgModDescription.classList.add("d-none");
      msgModUrl.classList.add("d-none");
      return true;
    }

    return false;
  }

  if (!formModValidation()) {
    return;
  }

  
  const data = {
      name: name.value,
      description: description.value,
      logo: logo.value,
      //author: 1
  };
  
  console.log(data)

  const accessToken = localStorage.getItem("access_token");

  await fetch("https://apipagos-production.up.railway.app/users/api/v2/service/"+idServicio+"/", {
      method: "PUT",
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