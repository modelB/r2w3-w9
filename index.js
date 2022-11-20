// top of index.js
let currentTrade = {};
let currentSelectSide;

async function connect() {
  /** MetaMask injects a global API into websites visited by its users at `window.ethereum`. This API allows websites to request users' Ethereum accounts, read data from blockchains the user is connected to, and suggest that the user sign messages and transactions. The presence of the provider object indicates an Ethereum user. Read more: https://ethereum.stackexchange.com/a/68294/85979**/

  // Check if MetaMask is installed, if it is, try connecting to an account
  if (typeof window.ethereum !== "undefined") {
    try {
      console.log("connecting");
      // Requests that the user provides an Ethereum address to be identified by. The request causes a MetaMask popup to appear. Read more: https://docs.metamask.io/guide/rpc-api.html#eth-requestaccounts
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    // If connected, change button to "Connected"
    document.getElementById("login_button").innerHTML = "Connected";
    // If connected, enable "Swap" button
    document.getElementById("swap_button").disabled = false;
  }
  // Ask user to install MetaMask if it's not detected
  else {
    document.getElementById("login_button").innerHTML =
      "Please install MetaMask";
  }
}

// index.js
function openModal(side) {
  // Store whether the user has selected a token on the from or to side
  currentSelectSide = side;
  document.getElementById("token_modal").style.display = "block";
}
function closeModal() {
  document.getElementById("token_modal").style.display = "none";
}

// Function to display the image and token symbols
function renderInterface() {
  if (currentTrade.from) {
    console.log(currentTrade.from);
    // Set the from token image
    document.getElementById("from_token_img").src = currentTrade.from.logoURI;
    // Set the from token symbol text
    document.getElementById("from_token_text").innerHTML =
      currentTrade.from.symbol;
  }
  if (currentTrade.to) {
    // Set the to token image
    document.getElementById("to_token_img").src = currentTrade.to.logoURI;
    // Set the to token symbol text
    document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
  }
}

function selectToken(token) {
  // When a token is selected, automatically close the modal
  closeModal();
  // Track which side of the trade we are on - from/to
  currentTrade[currentSelectSide] = token;
  // Log the selected token
  console.log("currentTrade:", currentTrade);

  renderInterface();
}

async function listAvailableTokens() {
  console.log("initializing");
  let response = await fetch("https://tokens.coingecko.com/uniswap/all.json");
  let tokenListJSON = await response.json();
  console.log("listing available tokens: ", tokenListJSON);
  tokens = tokenListJSON.tokens;
  console.log("tokens:", tokens);

  // Create a token list for the modal
  let parent = document.getElementById("token_list");
  // Loop through all the tokens inside the token list JSON object
  for (const i in tokens) {
    // Create a row for each token in the list
    let div = document.createElement("div");
    div.className = "token_row";
    // For each row, display the token image and symbol
    let html = `
      <img class="token_list_img" src="${tokens[i].logoURI}">
        <span class="token_list_text">${tokens[i].symbol}</span>
        `;
    div.innerHTML = html;
    // selectToken() will be called when a token is clicked
    div.onclick = () => {
      selectToken(tokens[i]);
    };
    parent.appendChild(div);
  }
  if (tokens.length > 1) {
    currentSelectSide = "from";
    selectToken(tokens[0]);
    currentSelectSide = "to";
    selectToken(tokens[1]);
  }
}

async function init() {
  console.log("initializing");
  await listAvailableTokens();
}
init();

// Call the connect function when the login_button is clicked
document.getElementById("login_button").onclick = connect;
document.getElementById("from_token_select").onclick = () => {
  openModal("from");
};
document.getElementById("to_token_select").onclick = () => {
  openModal("to");
};
document.getElementById("modal_close").onclick = closeModal;
// at the bottom of index.js add this
document.getElementById("from_amount").onblur = getPrice;
