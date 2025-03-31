"use client";
import { ReactNode, useState } from "react";
import { Menu } from "./menu";
import { Message } from "../common";
import { Alert } from "../common/message";
import styles from "./Layout.module.css";

interface LayoutProps {
    titulo?: string;
    children?: ReactNode;
    mensagens?: Array<Alert>;
    wide?: boolean;  // Nova prop
}

export const Layout: React.FC<LayoutProps> = ({ titulo, children, mensagens, wide }) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className={styles.app}>
            <Menu expanded={expanded} setExpanded={setExpanded} />
            <section className={`${styles.mainContent} ${expanded ? styles.expanded : styles.collapsed}`}>
            <div className={`${wide ? styles.containerLarge : "container"}`}>
                    <div className="section">
                        <div className="card">
                            <div className="card-header">
                                <p className="card-header-title">{titulo}</p>
                            </div>
                            <div className="card-content">
                                <div className="content">
                                    {mensagens?.map((msg, index) => (
                                        <Message key={index} {...msg} />
                                    ))}
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
