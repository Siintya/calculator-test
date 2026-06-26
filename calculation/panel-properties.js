class PanelProperties {
    calculate(cltLayup) {
        if (!cltLayup.isValid) {
            return new PanelPropertiesType(0, []);
        }

        if (cltLayup.method === "Shear Analogy") {
            const runner = new ShearAnalogyMethod();
            return runner.calculate(cltLayup);
        } else {
            const runner = new GammaMethod();
            return runner.calculate(cltLayup);
        }
    }
}

class ShearAnalogyMethod extends PanelProperties {
    calculate(cltLayup) {
        const globalCentroid = cltLayup.totalThickness / 2;
        let currentY = 0;
        let totalEI_eff = 0;
        const layerDetails = [];
        const material = GRADE_DATABASE[cltLayup.grade];

        for (let layer of cltLayup.getLayers()) {
            const yi = currentY + (layer.thickness / 2);
            currentY += layer.thickness;

            const hi = Math.abs(yi - globalCentroid);
            const E_XX = (layer.orientation === 0) ? material.e : 0;

            const I_local = (cltLayup.beff * Math.pow(layer.thickness, 3)) / 12;
            const I_distance = cltLayup.beff * layer.thickness * Math.pow(hi, 2);
            const EiIi = (I_local + I_distance) * E_XX;

            totalEI_eff += EiIi;

            layerDetails.push(
                new CLTLayerPropertiesType(layer.layerNumber, layer.orientation, layer.thickness, yi, hi, E_XX, EiIi)
            );
        }

        return new PanelPropertiesType(totalEI_eff, layerDetails);
    }
}

class GammaMethod extends PanelProperties {
    calculate(cltLayup) {
        const layerDetails = [];
        let totalEI_eff = 0;

        const material = GRADE_DATABASE[cltLayup.grade];
        const E0 = material.e;
        const G90 = material.g90;
        const b = cltLayup.beff;
        const t = cltLayup.thicknessEach;
        const L = 5000; // Panjang bentang default 5 meter 

        if (cltLayup.totalLayers === 5) {
            const a1 = t + t;
            const a3 = t + t;
            
            // Rumus reduksi geser Gamma (𝛾)
            const gamma1 = 1 / (1 + (Math.PI * Math.PI * E0 * t) / (Math.pow(L, 2) * (G90 / t) * a1));
            const gamma3 = 1 / (1 + (Math.PI * Math.PI * E0 * t) / (Math.pow(L, 2) * (G90 / t) * a3));
            const gamma2 = 1.0; 

            const d1 = (gamma3 * a3 - gamma1 * a1) / (gamma1 + gamma2 + gamma3);
            const d2 = d1 + a1;
            const d3 = a3 - d1;

            for (let layer of cltLayup.getLayers()) {
                let g_factor = 0;
                let dist_a = 0;
                const E_XX = (layer.orientation === 0) ? material.e : 0;

                if (layer.layerNumber === 1) { g_factor = gamma1; dist_a = d2; }
                else if (layer.layerNumber === 3) { g_factor = gamma2; dist_a = d1; }
                else if (layer.layerNumber === 5) { g_factor = gamma3; dist_a = d3; }

                const I_local = (b * Math.pow(layer.thickness, 3)) / 12;
                const EiIi = (E_XX * I_local) + (g_factor * E_XX * (b * layer.thickness) * Math.pow(dist_a, 2));
                totalEI_eff += EiIi;

                layerDetails.push(
                    new CLTLayerPropertiesType(layer.layerNumber, layer.orientation, layer.thickness, 0, 0, E_XX, EiIi, dist_a, g_factor)
                );
            }
        } else if (cltLayup.totalLayers === 3) {
            const a1 = t;
            const gamma1 = 1 / (1 + (Math.PI * Math.PI * E0 * t) / (Math.pow(L, 2) * (G90 / t) * a1));
            
            for (let layer of cltLayup.getLayers()) {
                const E_XX = (layer.orientation === 0) ? material.e : 0;
                let g_factor = (layer.layerNumber === 2) ? 1.0 : gamma1;
                let dist_a = (layer.layerNumber === 2) ? 0 : a1;

                const I_local = (b * Math.pow(layer.thickness, 3)) / 12;
                const EiIi = (E_XX * I_local) + (g_factor * E_XX * (b * layer.thickness) * Math.pow(dist_a, 2));
                totalEI_eff += EiIi;

                layerDetails.push(
                    new CLTLayerPropertiesType(layer.layerNumber, layer.orientation, layer.thickness, 0, 0, E_XX, EiIi, dist_a, g_factor)
                );
            }
        }

        return new PanelPropertiesType(totalEI_eff, layerDetails);
    }
}