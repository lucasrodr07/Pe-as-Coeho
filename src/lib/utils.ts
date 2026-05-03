/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, parseISO } from "date-fns";
import { Status } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '--';
  const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  
  // Handle both YYYY-MM-DD and DD/MM/YYYY
  if (parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function getStatus(dataProximaValidacao: string): Status {
  if (!dataProximaValidacao) return 'vermelho';
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const prox = parseISO(dataProximaValidacao);
    const diff = differenceInDays(prox, today);
    
    if (diff > 45) return 'verde';
    if (diff >= 16) return 'amarelo';
    return 'vermelho';
  } catch (e) {
    return 'vermelho';
  }
}

export function getDaysRemaining(dataProximaValidacao: string): number {
  if (!dataProximaValidacao) return -999;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const prox = parseISO(dataProximaValidacao);
    return differenceInDays(prox, today);
  } catch (e) {
    return -999;
  }
}
