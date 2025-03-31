"use client";
import { Button } from "primereact/button";
import styles from "./Menu.module.css";
import { classNames } from "primereact/utils";
import { 
        FaClipboardList,
        FaUsers,
        FaShoppingCart,
        FaFileInvoice,
        FaTruck,
        FaHome,
        FaSignOutAlt,
        FaChevronDown,
        FaChevronRight,
        FaUserCog,
        FaUserTie,
        FaRegEdit,
        FaProductHunt,
        FaSitemap,
        FaTag,
        FaUnsplash,
        FaPaperclip,
        FaUser,
        FaDesktop,
        FaShoppingBag
} from "react-icons/fa";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { usePermissao } from "../../../app/hooks/usePermissoes";

interface MenuProps {
    expanded: boolean;
    setExpanded: (value: boolean) => void;
}

interface MenuItem {
    label: string;
    icon: JSX.Element;
    href?: string; // Mantém null como valor aceitável
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    children?: MenuItem[];
}

export const Menu: React.FC<MenuProps> = ({ expanded, setExpanded }) => {
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

    const { role, permissoes } = usePermissao();

    const toggleMenu = (label: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const isMaster = role === "ROLE_MASTER" || role === "ROLE_MASTER_FULL";
    
    const rawMenuItems: (MenuItem | null)[] = [
        {
            label: "Dashboard",
            icon: <FaHome/>,
            href: "/dashboard",
        },
        {
            label: "Administração",
            icon: <FaFileInvoice />,
            children: [
                isMaster ? { label: "Usuários", href: "/consultas/usuarios", icon: <FaUsers /> } : null,
                isMaster ? { label: "Funções", href: "/cadastros/funcoes", icon: <FaPaperclip /> } : null,
                permissoes["Funcionários"]?.podeAcessar ? { label: "Funcionários", href: "/consultas/funcionarios", icon: <FaUserCog /> } : null,
                permissoes["Fornecedores"]?.podeAcessar ? { label: "Fornecedores", href: "/consultas/fornecedores", icon: <FaTruck /> } : null,
                permissoes["Unidade Medida"]?.podeAcessar ? { label: "Unidade Medida", href: "/consultas/unidadesMedida", icon: <FaDesktop /> } : null,
                permissoes["Tipos Características"]?.podeAcessar ? { label: "Tipos Info. Complementares", href: "/consultas/tiposCaracteristicas", icon: <FaTag /> } : null,
            ].filter(Boolean) as MenuItem[], // ✅ Garante que o array final tenha apenas MenuItem
        },
        {
            label: "Clientes",
            icon: <FaUserTie />,
            href: permissoes["Clientes"]?.podeAcessar ? "/consultas/clientes" : undefined,
        },
        {
            label: "Produtos",
            icon: <FaShoppingCart/>,
            children: [
                permissoes["Categorias"]?.podeAcessar && { label: "Categorias", href: "/consultas/categorias", icon: <FaSitemap /> },
                permissoes["Produtos"]?.podeAcessar && { label: "Produtos", href: "/consultas/produtos", icon: <FaProductHunt /> }
            ].filter(Boolean) as MenuItem[], // 🔹 Aqui garantimos um array válido
        },
        {
            label: "Ficha Orçamento",
            icon: <FaRegEdit/>,
            children: [
                permissoes["Ficha de Orçamento"]?.podeAcessar && { label: "Ficha Orçamento", href: "/consultas/fichaOrcamento", icon: <FaRegEdit /> },
                permissoes["Relatório Ficha de Orçamento"]?.podeAcessar && { label: "Relatórios", href: "/relatorios/fichaOrcamento", icon: <FaClipboardList /> }
            ].filter(Boolean) as MenuItem[], // 🔹 Aqui garantimos um array válido
        },
        {
            label: "Pedido",
            icon: <FaFileInvoice/>,
            children: [
                permissoes["Pedido Orçamento"]?.podeAcessar && { label: "Pedido Orçamento", href: "/consultas/pedidoOrcamento", icon: <FaFileInvoice /> },
                permissoes["Recuperação Venda"]?.podeAcessar && { label: "Recuperação Venda", href: "/controle/recuperacaoPedido", icon: <FaShoppingBag /> },
                permissoes["Relatório Pedido de Orçamento"]?.podeAcessar && { label: "Relatórios", href: "/relatorios/pedidoOrcamento", icon: <FaClipboardList /> }
            ].filter(Boolean) as MenuItem[], // 🔹 Aqui garantimos um array válido
        },
        {
            label: "Ordem Serviço Manutenção",
            icon: <FaUnsplash/>,
            children: [
                permissoes["Ordem de Serviço Manutenção"]?.podeAcessar && { label: "Ordem Serviço Manutenção", href: "/consultas/ordemServicoManutencao", icon: <FaUnsplash /> },
                permissoes["Relatório Ordem de Serviço Manutenção"]?.podeAcessar && { label: "Relatórios", href: "/relatorios/ordemServicoManutencao", icon: <FaClipboardList /> }
            ].filter(Boolean) as MenuItem[],// 🔹 Aqui garantimos um array válido
        },
        {
            label: "Perfil",
            icon: <FaUser/>,
            href: "/perfil",
        },
        {
            label: "Sair",
            icon: <FaSignOutAlt />,
            onClick: async (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault(); // Previne comportamento inesperado
            
                await signOut({ callbackUrl: "/login" }); // Redireciona automaticamente
            },
        },
    ];

    const menuItems: MenuItem[] = rawMenuItems.filter((item): item is MenuItem => {
        if (!item) return false;
        // Se o item não possui href ou onClick e possui children vazios, descarta-o
        if (!item.href && !item.onClick && item.children && item.children.length === 0) {
            return false;
        }
        return true;
    });
      


    return (
        <div className={classNames(styles.sidebar, { [styles.expanded]: expanded, [styles.collapsed]: !expanded })}>
            <Button
                icon={expanded ? "pi pi-angle-left" : "pi pi-angle-right"}
                className={styles.toggleButton}
                onClick={() => setExpanded(!expanded)}
            />

            <ul className={styles.menuList}>
            {menuItems.map((item, index) => {
                if (item.onClick) {
                    return (
                    <div key={index} className={styles.menuLink}>
                        <button onClick={item.onClick} className={styles.menuButton}>
                        <span className={styles.icon}>{item.icon}</span>
                        {expanded && <span className={styles.label}>{item.label}</span>}
                        </button>
                    </div>
                    );
                } else if (item.href || item.children) { // Alterado: renderiza se tiver href OU children
                    return (
                    <li key={index} className={styles.menuItem}>
                        {/* Se NÃO tiver submenu, usa <a> */}
                        {!item.children ? (
                        <a href={item.href} className={styles.menuLink}>
                            <span className={styles.icon}>{item.icon}</span>
                            {expanded && <span className={styles.label}>{item.label}</span>}
                        </a>
                        ) : (
                        // Se tiver submenu, usa <div> para toda a área clicável
                        <div className={styles.menuLink} onClick={() => toggleMenu(item.label)}>
                            <span className={styles.icon}>{item.icon}</span>
                            {expanded && <span className={styles.label}>{item.label}</span>}
                            {expanded && (
                            <span className={styles.chevron}>
                                {openMenus[item.label] ? <FaChevronDown /> : <FaChevronRight />}
                            </span>
                            )}
                        </div>
                        )}

                        {/* Renderizar Subitens */}
                        {item.children && openMenus[item.label] && (
                        <ul className={styles.subMenuList}>
                            {item.children.map((subItem, subIndex) => (
                            <li key={subIndex} className={styles.subMenuItem}>
                                <a href={subItem.href ?? undefined} className={styles.subMenuLink}>
                                <span className={styles.icon}>{subItem.icon}</span>
                                {expanded && <span>{subItem.label}</span>}
                                </a>
                            </li>
                            ))}
                        </ul>
                        )}
                    </li>
                    );
                } else {
                    return null;
                }
                })}
            </ul>
        </div>
    );
};
