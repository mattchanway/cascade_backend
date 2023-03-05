function toISOLocal(d) {
    var z  = n =>  ('0' + n).slice(-2);
    var zz = n => ('00' + n).slice(-3);
    var off = d.getTimezoneOffset();
    var sign = off > 0? '-' : '+';
    off = Math.abs(off);
  
    return d.getFullYear() + '-'
           + z(d.getMonth()+1) + '-' +
           z(d.getDate())  
  }

 module.exports = {toISOLocal}