export interface ImportHistoryType {
  id: number;
  importUnit: number;
  pricePerUnit: number;
  importDate: string;

  product: {
    id: number;
    name: string;
    imagePath: string;

    model: {
      id: number;
      name: string;

      brand: {
        id: number;
        name: string;
        country: string;
      };
    };

    color: {
      id: number;
      name: string;
    };

    salePrice: number;
    unit: number;
    typeSell: string;
    description: string;
    active: boolean;
  };
}
