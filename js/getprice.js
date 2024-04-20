async function fetchNosoCoinData() {
  try {
    const response = await fetch("https://api.nosocoin.com/info/price?range=day&interval=1");

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error("NosoCoin API request failed");
    }
  } catch (error) {
    console.error("Error fetching NosoCoin data:", error);
    return null;
  }
}

async function fetchBTCValue() {
  try {
    const response = await fetch('https://tradeogre.com/api/v1/markets');
    if (response.ok) {
      const data = await response.json();
      const btcUsdtAsk = data.find(market => market.hasOwnProperty("BTC-USDT"))["BTC-USDT"]["ask"];
      return btcUsdtAsk;
    } else {
      throw new Error("BTC value fetch request failed");
    }
  } catch (error) {
    console.error("Error fetching BTC value:", error);
    return null;
  }
}

async function fetchNosoUsdtAndUpdateElement() {
  try {
    const response = await fetch("https://api.nosocoin.com/info/price?range=day&interval=1");

    if (response.ok) {
      const result = await response.json();
      const nosoUsdtLastPrice = result[result.length - 1].price.toFixed(4); // Obtain the last price from the response
      const nosoUsdtLastPriceElement = document.getElementById("noso-usdt-lastPrice"); // Get the element
      nosoUsdtLastPriceElement.textContent = nosoUsdtLastPrice; // Update the element with the new value
      
      // Continue updating the value every 30 seconds
      setTimeout(fetchNosoUsdtAndUpdateElement, 30000);
    } else {
      throw new Error("NosoCoin API request failed");
    }
  } catch (error) {
    console.error("Error fetching NosoCoin data:", error);
  }
}

async function displayData() {
  const nosoUsdtLastPriceElement = document.getElementById("noso-usdt-lastPrice");
  const nosoBtcLastPriceElement = document.getElementById("noso-btc-lastPrice");

  // Initialize the values to 0
  nosoUsdtLastPriceElement.textContent = "0.0000";
  nosoBtcLastPriceElement.textContent = "0.00000000";

  // Initial call to fetchNosoUsdtAndUpdateElement
  fetchNosoUsdtAndUpdateElement();

  const nosoCoinData = await fetchNosoCoinData();
  if (nosoCoinData && nosoCoinData.length > 0) {
    const lastDataPoint = nosoCoinData[nosoCoinData.length - 1];
    const nosoUsdtLastPrice = lastDataPoint.price.toFixed(4); // Convert to string
    
    // Slowly update the initial USDT value
    let currentUsdtPrice = 0;
    const targetUsdtPrice = parseFloat(nosoUsdtLastPrice);
    const usdtInterval = setInterval(() => {
      currentUsdtPrice += targetUsdtPrice / 20; // Increment by 1/20th of the target price
      nosoUsdtLastPriceElement.textContent = currentUsdtPrice.toFixed(4);
      if (currentUsdtPrice >= targetUsdtPrice) {
        clearInterval(usdtInterval);
      }
    }, 10); // Update every 500 milliseconds for a slow count-up

    // Update the last digit of the USDT price every 10 seconds
    let current1000thDigit = 0;
    let randomDigit = Math.floor(Math.random() * 10);
    const updateInterval = setInterval(() => {
      if (current1000thDigit < randomDigit) {
        current1000thDigit++;
        nosoUsdtLastPriceElement.textContent = nosoUsdtLastPrice.slice(0, -1) + current1000thDigit;
      } else if (current1000thDigit > randomDigit) {
        current1000thDigit--;
        nosoUsdtLastPriceElement.textContent = nosoUsdtLastPrice.slice(0, -1) + current1000thDigit;
      }

      // Update the BTC value accordingly
      const btcValue = parseFloat(nosoBtcLastPriceElement.textContent);
      const updatedBtcValue = btcValue * (parseFloat(nosoUsdtLastPriceElement.textContent) / parseFloat(nosoUsdtLastPriceElement.textContent.slice(0, -1) + (current1000thDigit - 1)));
      nosoBtcLastPriceElement.textContent = updatedBtcValue.toFixed(8);
    }, 50); // Update every 50 milliseconds

    // Update the random digit every 10 seconds
    setInterval(() => {
      randomDigit = Math.floor(Math.random() * 10);
    }, 10000);

    const btcValue = await fetchBTCValue();
    if (btcValue) {
      const nosoValueInUsdt = lastDataPoint.price; // Use the obtained Noso value
      const nosoToBtcValue = (nosoValueInUsdt / btcValue).toFixed(8); // Convert to string

      // Initialize the BTC value
      nosoBtcLastPriceElement.textContent = nosoToBtcValue;
    } else {
      nosoBtcLastPriceElement.textContent = "Failed to calculate Noso to BTC value.";
    }
  } else {
    nosoUsdtLastPriceElement.textContent = "API Unavailable.";
    nosoBtcLastPriceElement.textContent = "";
  }
}

displayData();
