function toClipboard(text, containerElem = document.body){
    let tmp = document.createElement('input');
    tmp.value = text;
    tmp.style.height = '0';
    containerElem.appendChild(tmp);
    tmp.focus();
    tmp.select();
    document.execCommand('Copy');
    containerElem.removeChild(tmp);
}

export default toClipboard;