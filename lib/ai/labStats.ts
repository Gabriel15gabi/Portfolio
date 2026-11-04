/* Pasos de entrenamiento que han dado todos los modelos del
   laboratorio durante esta visita (se muestra en vivo en la cabecera). */
let total = 0;

export function addTrainingSteps(n: number) {
  total += n;
}

export function trainingSteps() {
  return total;
}
