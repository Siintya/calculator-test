class CLTLayupType {
    constructor(grade, method, totalLayers, thicknessEach, beff) {
        this.grade = grade;
        this.method = method;
        this.totalLayers = totalLayers;
        this.thicknessEach = thicknessEach;
        this.beff = beff;
        
        this.layers = [];
        this.totalThickness = 0;
        this.isValid = true;
        this.errorMessage = "";

        this.buildAndValidate();
    }

    buildAndValidate() {
        if (this.method === "Shear Analogy") {
            if (this.totalLayers < 3 || this.totalLayers > 9) {
                this.isValid = false;
                this.errorMessage = "Metode Shear Analogy hanya mendukung susunan 3 sampai 9 lapisan.";
                return;
            }
        } else if (this.method === "Gamma Method") {
            if (this.totalLayers !== 3 && this.totalLayers !== 5) {
                this.isValid = false;
                this.errorMessage = "Sesuai regulasi, Metode Gamma HANYA mendukung susunan 3 atau 5 lapisan.";
                return;
            }
        }

        this.totalThickness = this.totalLayers * this.thicknessEach;

        for (let i = 1; i <= this.totalLayers; i++) {
            // Lapisan Ganjil = 0°, Lapisan Genap = 90°
            const orientation = (i % 2 !== 0) ? 0 : 90;
            this.layers.push(new CLTLayerType(i, orientation, this.thicknessEach));
        }

        for (let i = 0; i < Math.floor(this.layers.length / 2); i++) {
            const topLayer = this.layers[i];
            const bottomLayer = this.layers[this.layers.length - 1 - i];
            
            if (topLayer.orientation !== bottomLayer.orientation || topLayer.thickness !== bottomLayer.thickness) {
                this.isValid = false;
                this.errorMessage = "Kesalahan Batasan Struktural: Susunan panel CLT harus simetris atas-bawah!";
                return;
            }
        }
    }

    getLayers() {
        return this.layers;
    }
}