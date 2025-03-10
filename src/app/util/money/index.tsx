export const converterEmBigDecimal = (value: string): number => {
    if (!value) {
        return 0;
    }
    return Number(value.replace(".", "").replace(",", "."));
}

export const formatReal = (valor: string): string => {
    if (!valor) {
        return "0,00";
    }

    // Converte para número antes da operação aritmética
    const numeroLimpo = parseInt(valor.replace(/\D/g, ''));
    const valorEmReais = (numeroLimpo / 100).toFixed(2);
    const v = valorEmReais.split('.');

    const m = v[0].split('').reverse().join('').match(/.{1,3}/g);

    if (!m) {
        return "0,00";
    }

    for (let i = 0; i < m.length; i++) {
        m[i] = m[i].split('').reverse().join('') + '.';
    }

    const r = m.reverse().join('');

    return r.substring(0, r.lastIndexOf('.')) + ',' + v[1];
}

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };