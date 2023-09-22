const token = localStorage.getItem("token");
let rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

let totalExpense = 0;

window.addEventListener("DOMContentLoaded", async () => {
  try {
    startLoader();
    const userExpenseArray = await axios(
      "http://localhost:3000/expenses/generatereport",
      {
        headers: { Authorization: token },
      }
    );
    const welcomeText = document.getElementById("welcomeText");
    welcomeText.innerText = `Hello, ${
      userExpenseArray.data.userName.split(" ")[0]
    }`;

    const userExpenseList = userExpenseArray.data.expenses;
    document.getElementById(
      "fullReportYear"
    ).innerText = `Full Report - ${new Date().getFullYear()}`;

    const expenseTable = document.createElement("div");
    expenseTable.className =
      "container table-responsive p-4 pb-0 d-flex flex-column";

    let table = document.querySelector("table");
    let data = Object.keys(userExpenseList[0]);
    generateTableHead(table, data);
    generateTable(table, userExpenseList);
    // console.log(totalExpense);

    const total = document.createElement("h5");
    total.className = "text-end mb-4 text-danger";
    total.innerHTML = `Total Expenses = ${rupee.format(totalExpense)}`;
    document.getElementById("tableDiv").appendChild(total);
    /* DOWNLOAD REPORT START */

    if (!userExpenseArray.data.isPremium) {
      stopLoader();
      return;
    }

    const response = await axios(
      "http://localhost:3000/users/expense-report-downloaded-list",
      {
        headers: { Authorization: token },
      }
    );
    const downloadReportDiv = document.getElementById("downloadReportDiv");
    const downloadReport = document.createElement("button");
    downloadReport.className = "btn btn-primary mb-4";
    downloadReport.innerHTML =
      'Download Report <i class="fa fa-arrow-alt-circle-down ms-2"></i>';
    downloadReportDiv.appendChild(downloadReport);

    const h3 = document.createElement("h3");
    h3.className = "w-100 fw-bold mt-2";
    h3.textContent = "Previous Downloads";

    downloadReportDiv.appendChild(h3);
    const allExpensesList = response.data.expenseList;

    let i = 0;
    allExpensesList.forEach((expense) => {
      // console.log(expense);
      const a = document.createElement("a");
      a.className = "list-group-item border-0 ps-0 pb-0 w-100";
      a.href = `${expense.fileUrl}`;
      a.innerHTML = `♦ Expense ${(i += 1)} - <span class="fw-bold">Downloaded On:</span> ${new Date(
        expense.createdAt
      ).toDateString()}`;

      downloadReportDiv.appendChild(a);
    });

    stopLoader();

    downloadReport.addEventListener("click", async () => {
      try {
        startLoader();
        const response = await axios.get(
          "http://localhost:3000/users/downloadexpensesreport",
          {
            headers: { Authorization: token },
          }
        );
        if (response.status === 200) {
          var a = document.createElement("a");
          a.href = response.data.fileUrl;
          //   a.download = "myExpense.csv";
          a.click();
          stopLoader();
          alert("Successfully Download!");
        }
      } catch (error) {
        stopLoader();
        console.log(error);
        alert("Download Failed");
      }
    });
  } catch (error) {
    stopLoader();
    console.log(error);
    window.location.replace("../login/login.html");
  }
});

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  if (token) localStorage.setItem("token", "");
  window.location.replace("../login/login.html");
});

const profilePic = document.getElementById("profilePic");
profilePic.addEventListener("click", () => {
  const welcomeDiv = document.getElementById("welcomeDiv");
  welcomeDiv.classList.toggle("profileShow");
});

function generateTableHead(table) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  let thData = ["Amount", "Description", "Category", "Date"];
  for (let key of thData) {
    let th = document.createElement("th");
    if (key === "Amount") th.className = "text-end";
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (let key in element) {
      if (key === "createdAt") {
        let cell = row.insertCell();
        let text = document.createTextNode(
          new Date(element[key]).toLocaleDateString()
        );
        cell.className = "fw-bold";
        cell.appendChild(text);
      } else if (key === "amount") {
        let cell = row.insertCell();
        let text = document.createTextNode(rupee.format(element[key]));
        cell.className = "text-end";
        cell.appendChild(text);
        totalExpense += element[key];
      } else {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
  }
}

function startLoader() {
  const loaderDiv = document.getElementById("loaderDiv");
  loaderDiv.style.display = "flex";
}

function stopLoader() {
  const loaderDiv = document.getElementById("loaderDiv");
  loaderDiv.style.display = "none";
}
