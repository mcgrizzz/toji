import type { MineralSalt } from '$lib/engine/models/catalogTypes';

export const availableSalts: MineralSalt[] = [
	{
		id: '00000006-0000-0000-0000-000000000001',
		name: 'MgSO4·7H2O (Epsom Salt)',
		isBuiltIn: true,
		primaryIon: 'Mg',
		contributions: [
			{ ionSymbol: 'Mg', massGPerGSalt: 24.31 / 246.47 },
			{ ionSymbol: 'SO4', massGPerGSalt: 96.06 / 246.47 }
		]
	},
	{
		id: '00000006-0000-0000-0000-000000000002',
		name: 'NaCl (Table Salt)',
		isBuiltIn: true,
		primaryIon: 'Na',
		contributions: [
			{ ionSymbol: 'Na', massGPerGSalt: 22.99 / 58.44 },
			{ ionSymbol: 'Cl', massGPerGSalt: 35.45 / 58.44 }
		]
	},
	{
		id: '00000006-0000-0000-0000-000000000003',
		name: 'KH2PO4 (Monopotassium Phosphate)',
		isBuiltIn: true,
		primaryIon: 'PO4',
		contributions: [
			{ ionSymbol: 'K', massGPerGSalt: 39.10 / 136.09 },
			{ ionSymbol: 'PO4', massGPerGSalt: 94.97 / 136.09 }
		]
	},
	{
		id: '00000006-0000-0000-0000-000000000004',
		name: 'CaSO4 (Gypsum)',
		isBuiltIn: true,
		primaryIon: 'Ca',
		contributions: [
			{ ionSymbol: 'Ca', massGPerGSalt: 40.08 / 136.14 },
			{ ionSymbol: 'SO4', massGPerGSalt: 96.06 / 136.14 }
		]
	},
	{
		id: '00000006-0000-0000-0000-000000000005',
		name: 'CaCl2 (Calcium Chloride)',
		isBuiltIn: true,
		primaryIon: 'Ca',
		contributions: [
			{ ionSymbol: 'Ca', massGPerGSalt: 40.08 / 110.98 },
			{ ionSymbol: 'Cl', massGPerGSalt: 70.90 / 110.98 }
		]
	},
	{
		id: '00000006-0000-0000-0000-000000000006',
		name: 'KCl (Potassium Chloride)',
		isBuiltIn: true,
		primaryIon: 'K',
		contributions: [
			{ ionSymbol: 'K', massGPerGSalt: 39.10 / 74.55 },
			{ ionSymbol: 'Cl', massGPerGSalt: 35.45 / 74.55 }
		]
	},
	{
		id: '00000006-0000-0000-0000-000000000007',
		name: 'K2SO4 (Potassium Sulfate)',
		isBuiltIn: true,
		primaryIon: 'K',
		contributions: [
			{ ionSymbol: 'K', massGPerGSalt: 78.20 / 174.26 },
			{ ionSymbol: 'SO4', massGPerGSalt: 96.06 / 174.26 }
		]
	}
];
