import { Link } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, Building2, Code2, Cpu, Database, LayoutGrid,
  MapPin, MessageCircle, Search, Smartphone, Store, Tags,
} from "lucide-react";
import { MinimalTopBar, PublicFooter } from "./PublicChrome";
import "./AboutPage.css";

const WHATSAPP = "https://wa.me/5568992031340";

export function AboutPage() {
  return (
    <div className="ref-page pc-about-page pc-noheader-page">
      <MinimalTopBar variant="light" />

      <main id="conteudo-principal" className="pc-about">
        <section className="pc-about__hero" aria-labelledby="pc-about-title">
          <img
            className="pc-about__hero-bg"
            src="/marketplace-local-profissional-v2.webp"
            alt=""
            aria-hidden="true"
            loading="eager"
          />
          <div className="pc-about__hero-scrim" aria-hidden="true" />
          <div className="pc-about__hero-copy">
            <span className="pc-about__eyebrow"><BadgeCheck aria-hidden="true" /> Sobre a plataforma</span>
            <h1 id="pc-about-title">O comércio de Feijó, com preço à vista.</h1>
            <p>
              O PreçoCerto reúne num só lugar o que se vende na cidade e por quanto.
              Quem compra decide antes de sair de casa; quem vende ganha uma vitrine
              digital sem precisar montar uma do zero.
            </p>
          </div>
        </section>

        <section className="pc-about__section" aria-labelledby="pc-about-oque">
          <div className="pc-about__section-head">
            <span>A PLATAFORMA</span>
            <h2 id="pc-about-oque">O que o PreçoCerto faz</h2>
            <p>
              Feijó fica no interior do Acre, longe dos grandes centros de distribuição.
              Isso encarece o frete e faz o mesmo produto custar valores bem diferentes
              de uma loja para outra, às vezes na mesma rua. Sem um lugar que reúna esses
              preços, a única forma de comparar é andar a cidade perguntando. A plataforma
              existe para encurtar esse caminho.
            </p>
          </div>

          <div className="pc-about__grid">
            <article>
              <span className="pc-about__icon"><Search aria-hidden="true" /></span>
              <h3>Comparação de preços</h3>
              <p>
                Cada produto mostra o menor preço, o maior e a diferença entre eles,
                com o nome do estabelecimento e o bairro. A economia aparece em reais,
                não em porcentagem abstrata.
              </p>
            </article>
            <article>
              <span className="pc-about__icon"><Store aria-hidden="true" /></span>
              <h3>Catálogo por estabelecimento</h3>
              <p>
                Cada comércio cadastrado tem a própria página, com catálogo, bairro e
                forma de contato. Mercados, açougues, padarias, lanchonetes, farmácias,
                serviços e cultura local, cada um no seu lugar.
              </p>
            </article>
            <article>
              <span className="pc-about__icon"><Tags aria-hidden="true" /></span>
              <h3>Lista de compras</h3>
              <p>
                Monte a lista do mês e veja quanto ela custa em cada loja antes de
                escolher onde comprar. É a comparação que mais muda o valor da fatura,
                porque atua sobre a compra inteira e não sobre um item.
              </p>
            </article>
            <article>
              <span className="pc-about__icon"><LayoutGrid aria-hidden="true" /></span>
              <h3>Vitrine para quem vende</h3>
              <p>
                Um comerciante da cidade dificilmente vai contratar o desenvolvimento de
                uma loja virtual própria. Aqui ele publica catálogo e preços e passa a
                existir na busca, sem custo de montagem.
              </p>
            </article>
          </div>
        </section>

        <section className="pc-about__split" aria-labelledby="pc-about-como">
          <figure className="pc-about__figure">
            <img
              src="/home-editorial-2026/comparacao-no-mercado.webp"
              alt="Pessoa comparando preços de produtos dentro de um mercado em Feijó"
              loading="lazy"
              width="1200"
              height="800"
            />
          </figure>
          <div className="pc-about__split-copy">
            <span className="pc-about__eyebrow pc-about__eyebrow--ink"><BadgeCheck aria-hidden="true" /> Como os preços chegam aqui</span>
            <h2 id="pc-about-como">Informação local, conferida de perto</h2>
            <p>
              Os preços vêm de duas fontes. A primeira é o próprio estabelecimento, que
              publica e atualiza o catálogo dele. A segunda é a colaboração de quem compra:
              qualquer pessoa pode enviar um preço diferente que encontrou, com a nota da
              compra como comprovante.
            </p>
            <p>
              Preço de mercado muda, e nenhuma base acompanha isso em tempo real. Por isso
              cada página traz a data da coleta e o aviso para confirmar no estabelecimento
              antes de fechar a compra. A plataforma orienta a decisão; ela não substitui o
              que está na etiqueta.
            </p>
            <Link className="pc-about__link" to="/colaborar">
              Enviar um preço que você viu <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="pc-about__author" aria-labelledby="pc-about-autor">
          <div className="pc-about__author-copy">
            <span className="pc-about__eyebrow"><Code2 aria-hidden="true" /> Quem idealizou</span>
            <h2 id="pc-about-autor">Franc Denis</h2>
            <p className="pc-about__author-role">
              <MapPin aria-hidden="true" /> Morador de Feijó, Acre, e entusiasta de tecnologia
            </p>
            <p>
              O PreçoCerto nasceu de uma inquietação de quem mora aqui e conhece o problema
              de dentro: a diferença de preço entre as lojas da cidade é real e pesa no
              orçamento das famílias, mas ninguém tinha essa informação reunida.
            </p>
            <p>
              A plataforma foi idealizada e construída por Franc Denis, morador da cidade,
              usando ferramentas modernas de inteligência artificial como apoio ao
              desenvolvimento. A IA acelera a escrita do código e a revisão do que já existe;
              as decisões de produto, o desenho das telas e a conferência dos dados continuam
              sendo trabalho humano, feito por quem conhece o comércio de Feijó pelo nome.
            </p>
          </div>
          <figure className="pc-about__author-figure">
            <img
              src="/home-editorial-2026/promo-comercio-local-app-v2.webp"
              alt="Aplicativo do PreçoCerto aberto, mostrando a comparação de preços do comércio local"
              loading="lazy"
              width="1200"
              height="900"
            />
          </figure>
        </section>

        <section className="pc-about__stack" aria-labelledby="pc-about-tec">
          <div className="pc-about__section-head">
            <span>COMO O SITE FOI FEITO</span>
            <h2 id="pc-about-tec">A tecnologia por trás</h2>
            <p>
              Não é um site montado em construtor de páginas: é uma aplicação web escrita
              em código, do banco de dados até a última tela. Abaixo, o que roda por baixo
              do que você está vendo agora.
            </p>
          </div>

          <div className="pc-about__stack-grid">
            <article>
              <span className="pc-about__icon"><Code2 aria-hidden="true" /></span>
              <h3>TypeScript e React</h3>
              <p>
                A interface é escrita em <strong>TypeScript</strong>, a linguagem de
                programação do projeto, sobre a biblioteca <strong>React</strong>. TypeScript
                é o JavaScript com tipos: o computador avisa o erro antes de o usuário
                encontrar. O React organiza a tela em componentes reaproveitáveis, que é
                o que permite o mesmo cartão de produto aparecer igual em todo o site.
              </p>
            </article>
            <article>
              <span className="pc-about__icon"><Cpu aria-hidden="true" /></span>
              <h3>Vite</h3>
              <p>
                O <strong>Vite</strong> é a ferramenta que compila o projeto e entrega ao
                navegador só o pedaço de código de que cada página precisa. É por isso que
                a home abre sem carregar as telas de painel do lojista ou de administração.
              </p>
            </article>
            <article>
              <span className="pc-about__icon"><Database aria-hidden="true" /></span>
              <h3>Supabase e PostgreSQL</h3>
              <p>
                Produtos, preços e estabelecimentos ficam num banco
                <strong> PostgreSQL</strong> hospedado no <strong>Supabase</strong>, que também
                cuida do login e das permissões: cada lojista enxerga e edita apenas o próprio
                catálogo.
              </p>
            </article>
            <article>
              <span className="pc-about__icon"><Smartphone aria-hidden="true" /></span>
              <h3>Feito para o celular</h3>
              <p>
                A maior parte dos acessos vem do telefone, então o site foi desenhado a
                partir da tela pequena: alvos de toque grandes, tema claro e escuro, e
                imagens em formato leve para funcionar bem na conexão que a cidade tem.
              </p>
            </article>
          </div>
        </section>

        <section className="pc-about__cta" aria-labelledby="pc-about-servico">
          <div className="pc-about__cta-copy">
            <span className="pc-about__eyebrow"><Building2 aria-hidden="true" /> Desenvolvimento sob encomenda</span>
            <h2 id="pc-about-servico">Tem uma ideia? Ela pode virar site ou aplicativo.</h2>
            <p>
              O PreçoCerto é o que dá para fazer com tecnologia aqui de Feijó. Se você tem
              um negócio, um projeto ou uma ideia parada no papel, desenvolvo o site ou o
              aplicativo para qualquer tipo de negócio: loja virtual, catálogo, cardápio,
              agendamento, sistema interno ou presença digital para começar.
            </p>
            <p>
              Vamos conversar sobre o que você precisa, sem compromisso.
            </p>
            <div className="pc-about__cta-actions">
              <a className="pc-about__cta-primary" href={WHATSAPP} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" /> Falar no WhatsApp
                <span className="pc-about__cta-number">(68) 99203-1340</span>
              </a>
              <Link className="pc-about__cta-ghost" to="/contato">
                Outros canais de contato <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>

          <address className="pc-about__address">
            <span className="pc-about__address-label"><MapPin aria-hidden="true" /> Endereço</span>
            <strong>Rua Joel Ferreira de Sousa</strong>
            <span>Bairro Bela Vista</span>
            <span>Feijó, Acre</span>
            <span>CEP 69960-000</span>
          </address>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default AboutPage;
