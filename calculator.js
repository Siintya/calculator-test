const elMethod = document.getElementById('inputMethod');
const elGrade = document.getElementById('inputGrade');
const elTotalLayers = document.getElementById('inputTotalLayers');
const elThickness = document.getElementById('inputThickness');
const elBeff = document.getElementById('inputBeff');

const elLabelLayers = document.getElementById('labelLayers');
const elHelpText = document.getElementById('layerHelpText');
const elValidationAlert = document.getElementById('validationAlert');
const elOutTotalThickness = document.getElementById('outTotalThickness');
const elOutGlobalCentroid = document.getElementById('outGlobalCentroid');

const elResultTitle = document.getElementById('resultTitle');
const elResultValue = document.getElementById('resultValue');

const elSecShear = document.getElementById('sectionShearAnalogy');
const elSecGamma = document.getElementById('sectionGamma');
const elTableShear = document.getElementById('tableBodyShear');
const elTableGamma = document.getElementById('tableBodyGamma');

function handleMethodUIChange() {
    if (elMethod.value === "Shear Analogy") {
        elLabelLayers.textContent = "Total Layers (3-9)";
        elHelpText.textContent = "Shear Analogy menerima batasan 3 hingga 9 layers.";
        elSecShear.classList.remove('d-none');
        elSecGamma.classList.add('d-none');
    } else {
        elLabelLayers.textContent = "Total Layers (3 atau 5)";
        elHelpText.textContent = "Gamma Method dibatasi ketat hanya untuk 3 atau 5 layers.";
        elSecShear.classList.add('d-none');
        elSecGamma.classList.remove('d-none');
    }
    executeAppCalculation();
}

function executeAppCalculation() {
    const method = elMethod.value;
    const grade = elGrade.value;
    const totalLayers = parseInt(elTotalLayers.value) || 0;
    const thickness = parseFloat(elThickness.value) || 0;
    const beff = parseFloat(elBeff.value) || 0;

    const currentLayup = new CLTLayupType(grade, method, totalLayers, thickness, beff);

    if (!currentLayup.isValid) {
        elValidationAlert.textContent = currentLayup.errorMessage;
        elValidationAlert.classList.remove('d-none');
        elResultValue.textContent = "0 N-mm²/m";
        return;
    } else {
        elValidationAlert.classList.add('d-none');
    }

    elOutTotalThickness.textContent = `${currentLayup.totalThickness} mm`;
    elOutGlobalCentroid.textContent = `${(currentLayup.totalThickness / 2).toFixed(1)} mm`;
    elResultTitle.textContent = `EFFECTIVE FLEXURAL STIFFNESS (EI eff - ${method})`;

    const engine = new PanelProperties();
    const propertiesResult = engine.calculate(currentLayup);
    
    elResultValue.textContent = `${propertiesResult.totalEI_eff.toLocaleString('id-ID')} N-mm²/m`;

    if (method === "Shear Analogy") {
        let rowsHtml = '';
        propertiesResult.layerDetails.forEach((layer) => {
            rowsHtml += `
                <tr class="${layer.orientation === 0 ? 'layer-0' : 'layer-90'}">
                    <td class="fw-bold">Layer ${layer.layerNumber}</td>
                    <td>${layer.orientation}° ${layer.orientation === 0 ? '➔ (Longitudinal)' : '▲ (Transverse)'}</td>
                    <td>${layer.thickness}</td>
                    <td>${layer.yi.toFixed(1)}</td>
                    <td>${layer.hi.toFixed(1)}</td>
                    <td>${layer.E_XX}</td>
                    <td class="fw-bold">${layer.EiIi.toLocaleString('id-ID')}</td>
                </tr>
            `;
        });
        elTableShear.innerHTML = rowsHtml;
    } else {
        let rowsHtml = '';
        propertiesResult.layerDetails.forEach((layer) => {
            rowsHtml += `
                <tr class="${layer.orientation === 0 ? 'layer-0' : 'layer-90'}">
                    <td class="fw-bold">Layer ${layer.layerNumber}</td>
                    <td>${layer.orientation}° ${layer.orientation === 0 ? '➔ (Longitudinal)' : '▲ (Transverse)'}</td>
                    <td>${layer.thickness}</td>
                    <td>${layer.ai ? layer.ai.toFixed(1) : '-'}</td>
                    <td>${layer.gamma ? layer.gamma.toFixed(4) : '0.0000'}</td>
                    <td>${layer.E_XX}</td>
                    <td class="fw-bold">${layer.EiIi.toLocaleString('id-ID')}</td>
                </tr>
            `;
        });
        elTableGamma.innerHTML = rowsHtml;
    }
}

// Event Listeners
elMethod.addEventListener('change', handleMethodUIChange);
elGrade.addEventListener('change', executeAppCalculation);
elTotalLayers.addEventListener('input', executeAppCalculation);
elThickness.addEventListener('input', executeAppCalculation);
elBeff.addEventListener('input', executeAppCalculation);

window.addEventListener('DOMContentLoaded', () => {
    handleMethodUIChange();
});