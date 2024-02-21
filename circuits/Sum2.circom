pragma circom 2.0.0;

template Sum2() {
   // Declaration of signals.  
   signal input a;  
   signal input b;  
   signal output c;  

   // Constraints.  
   c <== a + b; 
}

component main = Sum2();