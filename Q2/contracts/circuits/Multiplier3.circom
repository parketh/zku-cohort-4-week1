pragma circom 2.0.4;

// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier3 () {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   signal input c;
   signal output d;  
   
   signal e;

   // Constraints.  
   e <-- b * c;
   d <== a * e;
}

component main = Multiplier3();