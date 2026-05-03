/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Area {
  id: string;
  nome: string;
  descricao?: string;
  dataCriacao: string;
}

export interface Peca {
  id: string;
  nome: string;
  pecaCoelho: string;
  partNumber: string;
  descricao: string;
  areaId: string;
  elaboradoPor: string;
  dataValidacao: string;
  dataProximaValidacao: string;
  dataCriacao: string;
}

export type Status = 'verde' | 'amarelo' | 'vermelho';
