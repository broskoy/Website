// update the value displayed under the slider
function sliderChanged(event) {
    let newValue = event.target.value;
    let element = document.getElementById("slider-label");
    element.textContent = newValue;
    document.documentElement.style.setProperty('--radius', `${newValue / 100 * 4}vh`);
}
