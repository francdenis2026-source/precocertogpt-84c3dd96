import { Route, Routes } from "react-router-dom";
import { MerchantDashboard } from "./MerchantDashboard";
import { MerchantCatalogStudio } from "./MerchantCatalogStudio";
import { MerchantOnlineSalesControl } from "./MerchantOnlineSalesControl";
import { MerchantBusinessSetup } from "./MerchantBusinessSetup";
import { MerchantManagementCenter } from "./MerchantManagementCenter";

// Cada tela abaixo já é uma página completa e independente: monta seu próprio
// shell (sidebar/cabeçalho) e se alimenta sozinha via loadMerchantMembership()/
// loadMerchantMemberships(), filtrando tudo por merchant_id. Este componente
// só faz o roteamento aninhado de /painel-lojista/*, sem chrome extra — assim
// não duplicamos sidebar/header em cima do que cada tela já renderiza.
export function MerchantPanelLayout() {
  return (
    <Routes>
      <Route index element={<MerchantDashboard />} />
      <Route path="catalogo" element={<MerchantCatalogStudio />} />
      <Route path="vendas-online" element={<MerchantOnlineSalesControl />} />
      <Route path="gestao" element={<MerchantManagementCenter />} />
      <Route path="configurar-negocio" element={<MerchantBusinessSetup />} />
    </Routes>
  );
}
