import GIXI from 'gixi'

function generate(name, size){
    return new GIXI(size, name).getImage();
}

export default generate;