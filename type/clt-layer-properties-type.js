class CLTLayerPropertiesType {
    constructor(layerNumber, orientation, thickness, yi, hi, E_XX, EiIi, ai = null, gamma = null) {
        this.layerNumber = layerNumber;
        this.orientation = orientation;
        this.thickness = thickness;
        this.yi = yi;      
        this.hi = hi;  
        this.E_XX = E_XX; 
        this.EiIi = EiIi;  
        
        this.ai = ai;       
        this.gamma = gamma; 
    }
}