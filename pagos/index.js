const logoutButton = document.querySelector('.logout-button');
logoutButton.addEventListener('click', function() {
  removeLocalStorage();
  GetPayments();
});

const pagosRealizados = document.querySelector(".row");
const pagosVencidos = document.querySelector(".two");
const body = document.querySelector("body");

let showAll = false;
let showAllExpired = false;


async function GetPayments() {
  // Intenta obtener el token de acceso almacenado en el almacenamiento local
  const accessToken = localStorage.getItem("access_token");
  //console.log("Access token: " + accessToken);

  // Si no hay un token de acceso almacenado, redirige al usuario a la página de login
  if (!accessToken) {
    window.location.href = "/login";
    return;
  }

  try {
    // Intenta obtener los pagos utilizando el token de acceso
    let response = await fetch(
      "https://apipagos-production.up.railway.app/users/api/v2/payment/",
      {
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      }
    );
    const payment = await response.json();
    //console.log(payment);

    // Si se obtienen los pagos correctamente, inténtalo obtener los servicios también
    response = await fetch(
      "https://apipagos-production.up.railway.app/users/api/v2/service/",
      {
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      }
    );
    const service = await response.json();
    //console.log(service);

    // Muestra los pagos y servicios en la página
    ShowPayment(payment, service);
    GetExpiredPayments(payment,service);
  } catch (error) {
    console.log(error);
    RefreshToken();
  }
}


async function GetExpiredPayments(payment,service) {
  // Intenta obtener el token de acceso almacenado en el almacenamiento local
  const accessToken = localStorage.getItem("access_token");
  //console.log("Access token: " + accessToken);

  // Si no hay un token de acceso almacenado, redirige al usuario a la página de login
  if (!accessToken) {
    window.location.href = "/login";
    return;
  }

  try {
    // Intenta obtener los pagos utilizando el token de acceso
    let response = await fetch(
      "https://apipagos-production.up.railway.app/users/api/v2/expired/",
      {
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      }
    );
    const expired_payments = await response.json();
    //console.log(payment);

    // Muestra los pagos y servicios en la página
    ShowExpiredPayments(expired_payments, payment, service);
  } catch (error) {
    console.log(error);
    RefreshToken();
  }
}







function ShowPayment(payments, service) {
  pagosRealizados.innerHTML = "";

  // Obtiene los pagos a mostrar
  let paymentsToShow;
  if (showAll) {
    paymentsToShow = payments.results;
  } else {
    paymentsToShow = payments.results.slice(0, 2);
  }

  // Muestra los pagos
  paymentsToShow.forEach((pay) => {
    const matchingService = service.results.find((serv) => serv.id_services === pay.service_id);
    if (matchingService) {
      pagosRealizados.innerHTML += `
        <div class="row justify-content-center">
          <div class="col-md-4 d-flex align-items-center">
            <img class="rounded-circle" style="width: 40px" src="${matchingService.logo}">
            <h4 class="card-title ml-3">${matchingService.name}</h4>
          </div>
          <div class="col-md-4 d-flex align-items-center">
            <p class="card-text">Fecha de pago: <strong>${pay.paymentDate}</strong></p>
          </div>
          <div class="col-md-4 d-flex align-items-center">
            <p class="card-text">Monto: <strong>S/. ${pay.amount}</strong></p>
          </div>
        </div>
      `;
    }
  });

  // Muestra el botón "Ver más" o "Ver menos" según corresponda
  if (showAll) {
    pagosRealizados.innerHTML += `
      <div class="row justify-content-center mt-3">
        <button class="btn btn-primary" id="showMoreButton">Ver menos</button>
      </div>
    `;
  } else if (payments.count > 2) {
    pagosRealizados.innerHTML += `
      <div class="row justify-content-center mt-3">
        <button class="btn btn-primary" id="showMoreButton">Ver más</button>
      </div>
    `;
  }

  // Agrega un manejador de eventos al botón "Ver más" o "Ver menos" según corresponda
  const showMoreButton = document.querySelector("#showMoreButton");
  if (showMoreButton) {
    showMoreButton.addEventListener("click", () => {
      showAll = !showAll;
      GetPayments();
    });
  }
}


function ShowExpiredPayments(expired_payments, payment, service) {
  pagosVencidos.innerHTML = "";

  // Obtiene los pagos a mostrar
  let expiredPaymentsToShow;
  if (showAllExpired) {
    expiredPaymentsToShow = expired_payments.results;
  } else {
    expiredPaymentsToShow = expired_payments.results.slice(0, 2);
  }

  // Muestra los pagos
  expiredPaymentsToShow.forEach((exp) => {
    const matchingPaymentUser = payment.results.find((pay) => pay.id_payment === exp.payment_user_id);
    const matchingService = service.results.find((serv) => serv.id_services === matchingPaymentUser.service_id);
    if (matchingService) {
      pagosVencidos.innerHTML += `
        <div class="row justify-content-center">
          <div class="col-md-4 d-flex align-items-center">
            <img class="rounded-circle" style="width: 40px" src="${matchingService.logo}">
            <h4 class="card-title ml-3">${matchingService.name}</h4>
          </div>
          <div class="col-md-4 d-flex align-items-center">
            <p class="card-text">Fecha de expiración: <strong>${matchingPaymentUser.expirationDate}</strong></p>
          </div>
          <div class="col-md-4 d-flex align-items-center">
            <p class="card-text">Monto: <strong>S/. ${matchingPaymentUser.amount}</strong></p>
          </div>
          <div class="col-md-4 d-flex align-items-center">
            <p class="card-text">Penalidad: <strong>S/. ${exp.penalty_fee_amount}</strong></p>
          </div>
        </div>
      `;
    }
  });

  // Muestra el botón "Ver más" o "Ver menos" según corresponda
  if (showAllExpired) {
    pagosVencidos.innerHTML += `
      <div class="row justify-content-center mt-3">
        <button class="btn btn-primary" id="showMoreButtonExpired">Ver menos</button>
      </div>
    `;
  } else if (expired_payments.count > 2) {
    pagosVencidos.innerHTML += `
      <div class="row justify-content-center mt-3">
        <button class="btn btn-primary" id="showMoreButtonExpired">Ver más</button>
      </div>
    `;
  }

  // Agrega un manejador de eventos al botón "Ver más" o "Ver menos" según corresponda
  const showMoreButtonExpired = document.querySelector("#showMoreButtonExpiredExpired");
  if (showMoreButtonExpired) {
    showMoreButtonExpired.addEventListener("click", () => {
      showAllExpired = !showAllExpired;
      GetExpiredPayments();
    });
  }
}






async function RefreshToken() {
  // Obtiene el valor del refresh token almacenado en el almacenamiento local
  const refreshToken = localStorage.getItem("refresh_token");

  // Envía una solicitud POST a la API con el valor del refresh token
  const response = await fetch("https://apipagos-production.up.railway.app/users/jwt/refresh/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh: refreshToken,
    }),
  });

  // Obtiene la respuesta de la API y la convierte a formato JSON
  const data = await response.json();

  // Si se obtuvo un nuevo token de acceso, actualiza el token almacenado en el almacenamiento local y vuelve a llamar a GetPayments()
  if (data.access) {
    localStorage.setItem("access_token", data.access);
    GetPayments();
    //GetExpiredPayments();
  } else {
    // Si no se obtuvo un nuevo token de acceso, redirige al usuario a la página de login
    window.location.href = "/login";
  }
}


function removeLocalStorage(){
  localStorage.clear();
}


// Llamar a la función refreshToken cada vez que se cargue la página
window.addEventListener("load", RefreshToken);

