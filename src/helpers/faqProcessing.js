
export default function(text, question = 'Q:', answer = 'A:'){
    return text.split('\n').reduce((acc, el) => {
        if(el) el = el.trim();
        // new Question
        if(el.startsWith(question)){
            acc.push([el]);
        }
        // new Answer
        else if(el.startsWith(answer)){
            acc.push([el]);
        }
        // add to last Question or answer
        else if(el && el.length > 0){
            acc[acc.length-1].push(el);
        }
        return acc;
    }, []).reduce((acc, el, i) => {
        // create for a Question a new Object
        if(el[0].startsWith(question)){
            el[0] = el[0].replace(question,'');
            acc.push({Q: el.join(' ')});
        // set the Answer to the last object
        }else{
            el[0] = el[0].replace(answer, '');
            acc[acc.length-1].A = el.join(' ');
        }
        return acc;
    }, [])
}