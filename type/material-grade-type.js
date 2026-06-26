class MaterialGradeType {
    constructor(e, e90, g, g90) {
        this.e = e;     
        this.e90 = e90; 
        this.g = g; 
        this.g90 = g90;
    }
}

const GRADE_DATABASE = {
    'MGP10': new MaterialGradeType(1100, 110, 687.5, 62.5),
    'MGP12': new MaterialGradeType(1100, 110, 687.5, 62.5)
};