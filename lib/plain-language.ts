/**
 * Plain language translations for gun violence statistics.
 * Every number gets a human translation. EN and ES.
 */

export function deathsPerInterval(deaths: number): { en: string; es: string } {
  const minutesInYear = 525600;
  const minutesPer = Math.round(minutesInYear / deaths);

  if (minutesPer < 60) {
    return {
      en: `That is one person every ${minutesPer} minutes.`,
      es: `Eso es una persona cada ${minutesPer} minutos.`,
    };
  }

  const hours = Math.floor(minutesPer / 60);
  const mins = minutesPer % 60;
  if (mins === 0) {
    return {
      en: `That is one person every ${hours} hour${hours > 1 ? "s" : ""}.`,
      es: `Eso es una persona cada ${hours} hora${hours > 1 ? "s" : ""}.`,
    };
  }
  return {
    en: `That is one person every ${hours} hour${hours > 1 ? "s" : ""} and ${mins} minutes.`,
    es: `Eso es una persona cada ${hours} hora${hours > 1 ? "s" : ""} y ${mins} minutos.`,
  };
}

export function annualSummary(
  year: number,
  deaths: number
): { en: string; es: string } {
  const interval = deathsPerInterval(deaths);
  return {
    en: `In ${year}, ${deaths.toLocaleString()} people died from gunshot wounds in the United States. ${interval.en}`,
    es: `En ${year}, ${deaths.toLocaleString()} personas murieron por heridas de bala en los Estados Unidos. ${interval.es}`,
  };
}

export function cumulativeSummary(
  startYear: number,
  endYear: number,
  totalDeaths: number
): { en: string; es: string } {
  return {
    en: `Between ${startYear} and ${endYear}, ${totalDeaths.toLocaleString()} people died from gun violence in the United States.`,
    es: `Entre ${startYear} y ${endYear}, ${totalDeaths.toLocaleString()} personas murieron por violencia armada en los Estados Unidos.`,
  };
}

export function rateSummary(
  rate: number,
  year: number
): { en: string; es: string } {
  return {
    en: `In ${year}, the gun death rate was ${rate.toFixed(1)} per 100,000 people.`,
    es: `En ${year}, la tasa de muertes por armas fue de ${rate.toFixed(1)} por cada 100,000 personas.`,
  };
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}
