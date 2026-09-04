import { lazy, Suspense, useEffect } from "react";
import { FooterSingleton } from "./components/layout/FooterSingleton";
import { AuthProvider } from "./auth/AuthProvider";
import { ForbiddenPage, RedirectIfAuthenticated, RequireAuth, RequireRole } from "./components/access/RouteGuards";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ProductCardQuickActions } from "./components/ProductCardQuickActions";
import { PersistentRadioProvider } from "./components/PersistentRadio";
import { DorinhaCommerceEnhancer } from "./components/DorinhaCommerceEnhancer";
import { UserAccountHub, UserAccountPage } from "./components/UserAccountExperience";
import { AdminLoginRedirect } from "./components/AdminLoginRedirect";
import { SingleBrowserTabGate } from "./components/SingleBrowserTabGate";
import { AdminProductEditorOverlay } from "./components/AdminProductEditorOverlay";
import { AdminVideoQuickAccess } from "./components/AdminVideoQuickAccess";
import { AuthActionPrompt } from "./components/AuthActionPrompt";
import { SeoRouteManager } from "./components/SeoRouteManager";
import { AdminMaintenanceControl, PlatformMaintenanceGate } from "./components/PlatformMaintenance";
import { FavoritesProvider } from "./features/favorites/FavoritesProvider";
import { ReferenceAuthPage, ReferenceFavoritesPage, ReferenceInfoPage, ReferenceMerchantDashboard, ReferenceNotFound, ReferenceStoresPage } from "./reference/ReferenceExperience";
import { MarketplaceSectorLanding, marketplaceSectors } from "./reference/MarketplaceSectors";
import { SectorHub2026 } from "./reference/SectorHub2026";
import { HomeNew2026 } from "./pages/HomeNew2026";
import { SubscriberGate } from "./components/access/SubscriberGate";
import { KellyBurgueriaPage } from "./pages/KellyBurgueriaPage";
import { PontoDoSandubaPage } from "./pages/PontoDoSandubaPage";

// Somente CSS técnico/funcional permanece global aqui.
// O sistema visual público antigo foi removido; a identidade ativa vem do
// campaign-theme.css carregado em main.tsx.
import "./reference/FavoritesAndSectorStability.css";
import "./reference/ExploreViewportFit.css";
import "./reference/AdminCatalogWorkspaceEnhancements.css";
import "./reference/AdminPerformance.css";
import "./reference/MobileSearchStability.css";
import "./reference/DesktopLiveSearch2026.css";
import "./reference/LiveSearchOverlayStackFix2026.css";
import "./reference/PublicExperiencePolish2026.css";

const SearchDiscovery2026 = lazy(() => import("./reference/SearchDiscovery2026").then(module => ({ default: module.SearchDiscovery2026 })));
const ProductDetailProfessional = lazy(() => import("./reference/ProductDetailLive2026").then(module => ({ default: module.ProductDetailLive2026 })));
const StoreDetailProfessional = lazy(() => import("./reference/StoreDetailProfessional").then(module => ({ default: module.StoreDetailProfessional })));
const CulturalProfilePage = lazy(() => import("./reference/CulturalProfilePage").then(module => ({ default: module.CulturalProfilePage })));
const DorinhaEditorialPage = lazy(() => import("./reference/DorinhaEditorialPage").then(module => ({ default: module.DorinhaEditorialPage })));
const MerchantOnboarding = lazy(() => import("./reference/MerchantOnboarding").then(module => ({ default: module.MerchantOnboarding })));
const AdminControlCenter = lazy(() => import("./reference/AdminControlCenter").then(module => ({ default: module.AdminControlCenter })));
const AdminCatalogWorkspace = lazy(() => import("./reference/AdminCatalogWorkspace").then(module => ({ default: module.AdminCatalogWorkspace })));
const AdminEnvironmentsPage = lazy(() => import("./reference/AdminCatalogWorkspace").then(module => ({ default: module.AdminEnvironmentsPage })));
const CityDirectoryPage = lazy(() => import("./pages/CityStoresPage").then(module => ({ default: module.CityDirectoryPage })));
const CityStoresPage = lazy(() => import("./pages/CityStoresPage").then(module => ({ default: module.CityStoresPage })));
const AdminAuthGate = lazy(() => import("./reference/AdminAuthGate").then(module => ({ default: module.AdminAuthGate })));
const AdminVideoStudio = lazy(() => import("./reference/AdminVideoStudio").then(module => ({ default: module.AdminVideoStudio })));
const SmartBasketPage = lazy(() => import("./reference/SmartBasketPage").then(module => ({ default: module.SmartBasketPage })));
const ProfessionalBasketPage = lazy(() => import("./reference/ProfessionalBasketPage").then(module => ({ default: module.ProfessionalBasketPage })));

function AppShellController(){const {pathname}=useLocation();useEffect(()=>{const publicApp=!pathname.startsWith('/admin')&&!pathname.startsWith('/painel-lojista')&&!pathname.startsWith('/lojista')&&!pathname.startsWith('/cadastro-lojista')&&!pathname.startsWith('/quero-vender');document.body.classList.toggle('pc-app-shell',publicApp);document.body.dataset.appRoute=pathname==='/'?'home':pathname.split('/').filter(Boolean)[0]||'home';return()=>{document.body.classList.remove('pc-app-shell');delete document.body.dataset.appRoute}},[pathname]);return null;}
function RouteFocusManager(){const location=useLocation();useEffect(()=>{if(location.pathname.startsWith('/admin'))return;const main=document.querySelector<HTMLElement>("#conteudo-principal, main");if(!main)return;if(!main.id)main.id="conteudo-principal";main.setAttribute("tabindex","-1");main.style.setProperty("outline","none","important");const appScreen=main.closest<HTMLElement>(".mh26-page,.msearch26-page,.ref-page,.pro-basket-page,.smart-basket-page,.pharmacy-directory-page");if(appScreen)appScreen.scrollTo({top:0,left:0,behavior:"auto"});else window.scrollTo({top:0,left:0,behavior:"auto"});window.requestAnimationFrame(()=>main.focus({preventScroll:true}));},[location.pathname]);return null;}
export default function App(){return <BrowserRouter><AuthProvider><SingleBrowserTabGate><PersistentRadioProvider><FavoritesProvider><a className="pc-skip-link" href="#conteudo-principal">Pular para o conteúdo</a><SeoRouteManager/><AppShellController/><RouteFocusManager/><DorinhaCommerceEnhancer/><AdminLoginRedirect/><AdminProductEditorOverlay/><AdminMaintenanceControl/><AdminVideoQuickAccess/><ProductCardQuickActions/><AuthActionPrompt/><FooterSingleton/><UserAccountHub/><PlatformMaintenanceGate><Suspense fallback={<main className="pc-route-loading" aria-label="Abrindo página" aria-busy="true"/>}><Routes>
<Route path="/" element={<HomeNew2026/>}/><Route path="/buscar" element={<SearchDiscovery2026/>}/><Route path="/explorar" element={<SectorHub2026/>}/>{marketplaceSectors.map(sector=><Route key={sector.id} path={sector.href} element={<MarketplaceSectorLanding sector={sector}/>}/>) }
<Route path="/produto/:identifier" element={<ProductDetailProfessional/>}/><Route path="/estabelecimentos" element={<ReferenceStoresPage/>}/><Route path="/cidades" element={<CityDirectoryPage/>}/><Route path="/cidade/:city" element={<CityStoresPage/>}/><Route path="/kelly-burgueria" element={<KellyBurgueriaPage/>}/><Route path="/estabelecimento/kelly-burgueria-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/estabelecimento/kelly-burgueria-e-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/loja/kelly-burgueria-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/loja/kelly-burgueria-e-lanchonete" element={<KellyBurgueriaPage/>}/><Route path="/ponto-do-sanduba" element={<PontoDoSandubaPage/>}/><Route path="/estabelecimento/ponto-do-sanduba" element={<PontoDoSandubaPage/>}/><Route path="/loja/ponto-do-sanduba" element={<PontoDoSandubaPage/>}/><Route path="/estabelecimento/:identifier" element={<StoreDetailProfessional/>}/><Route path="/loja/:identifier" element={<StoreDetailProfessional/>}/><Route path="/cesta" element={<RequireAuth><ProfessionalBasketPage/></RequireAuth>}/><Route path="/cesta-basica" element={<RequireAuth><ProfessionalBasketPage/></RequireAuth>}/><Route path="/cesta-inteligente" element={<RequireAuth><SubscriberGate tool="A Cesta Inteligente"><SmartBasketPage/></SubscriberGate></RequireAuth>}/><Route path="/favoritos" element={<RequireAuth><ReferenceFavoritesPage/></RequireAuth>}/><Route path="/minha-conta" element={<RequireAuth><UserAccountPage/></RequireAuth>}/>
<Route path="/login" element={<RedirectIfAuthenticated><ReferenceAuthPage mode="login"/></RedirectIfAuthenticated>}/><Route path="/cadastro" element={<RedirectIfAuthenticated><ReferenceAuthPage mode="register"/></RedirectIfAuthenticated>}/><Route path="/registrar" element={<RedirectIfAuthenticated><ReferenceAuthPage mode="register"/></RedirectIfAuthenticated>}/><Route path="/lojista" element={<MerchantOnboarding/>}/><Route path="/cadastro-lojista" element={<MerchantOnboarding/>}/><Route path="/quero-vender" element={<MerchantOnboarding/>}/><Route path="/403" element={<ForbiddenPage/>}/><Route path="/painel-lojista/*" element={<RequireRole allow="merchant" message="Esta área é exclusiva de estabelecimentos autorizados. Solicite acesso pelo cadastro de lojista."><ReferenceMerchantDashboard/></RequireRole>}/><Route path="/admin/catalogo" element={<AdminAuthGate><AdminCatalogWorkspace/></AdminAuthGate>}/><Route path="/admin/ambientes" element={<AdminAuthGate><AdminEnvironmentsPage/></AdminAuthGate>}/><Route path="/admin/videos" element={<AdminAuthGate><AdminVideoStudio/></AdminAuthGate>}/><Route path="/admin/*" element={<AdminAuthGate><AdminControlCenter/></AdminAuthGate>}/>
<Route path="/colaborar" element={<ReferenceInfoPage kind="collaborate"/>}/><Route path="/contato" element={<ReferenceInfoPage kind="contact"/>}/><Route path="/fale-conosco" element={<ReferenceInfoPage kind="contact"/>}/><Route path="/meus-pedidos" element={<RequireAuth><ReferenceInfoPage kind="orders"/></RequireAuth>}/><Route path="/cultura/*" element={<ReferenceInfoPage kind="culture"/>}/><Route path="/fremix-producoes" element={<CulturalProfilePage kind="fremix"/>}/><Route path="/autora/*" element={<DorinhaEditorialPage/>}/><Route path="/dorinha-barroso" element={<DorinhaEditorialPage/>}/><Route path="*" element={<ReferenceNotFound/>}/>
</Routes></Suspense></PlatformMaintenanceGate></FavoritesProvider></PersistentRadioProvider></SingleBrowserTabGate></AuthProvider></BrowserRouter>}
