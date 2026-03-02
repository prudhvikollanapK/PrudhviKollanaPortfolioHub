// App.jsx
import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Oval } from "react-loader-spinner";
import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiExternalLink,
  FiMove,
  FiGrid,
  FiBox,
  FiCpu,
  FiBarChart2,
  FiCode,
  FiUser,
  FiLayout,
  FiMonitor,
  FiList,
  FiTarget,
  FiCommand ,
  FiActivity
} from "react-icons/fi";
import { MdNetworkCheck   } from "react-icons/md";

import { GiGamepad, GiBrain, GiPuzzle } from "react-icons/gi";
import signature from "./assets/images/signature.png";

import documents from "./data.json";
import "./App.css";
import { FaC } from "react-icons/fa6";

Modal.setAppElement("#root");

const typeMeta = {
  portfolio: {
    label: "Personal Portfolio",
    description: "Central hub showcasing my work, timeline & achievements.",
    icon: <FiGrid />,
    tags: ["About Me", "Showcase", "Resume"],
  },
  "emi-master": {
    label: "Finance Tool",
    description: "Advanced EMI calculator with real-time visual insights.",
    icon: <FiBarChart2 />,
    tags: ["Planning", "Loans", "Calculator"],
  },
  housiee: {
    label: "Game",
    description: "Interactive online housie game built for fun sessions.",
    icon: <GiGamepad />,
    tags: ["Fun", "Party", "Multiplayer"],
  },
  tally: {
    label: "Puzzle",
    description: "A mini interactive maths game built for casual brain play.",
    icon: <FiCpu />,
    tags: ["Focus", "Time-pass", "Prototype"],
  },
  "mini-score-board": {
    label: "Mini ScoreBoard",
    description:
      "A fast, lightweight score tracker for quick games, challenges, and friendly matches.",
    icon: <FiList />,
    tags: ["Real-time", "Scorekeeping", "Game Tool"],
  },
  "score-dash-board": {
    label: "Smart Dashboard",
    description:
    "A real-time game session dashboard to organize matches, generate AI teams or players, balance squads and track scores with live rankings and stats.",
    icon: <FiMonitor />,
    tags: ["Live Scores", "AI Teams", "AI Players", "Team Balancing", "Leaderboard", "Multi-mode"],
  },

  "spin-out": {
    label: "Party Game",
    description: "Truth or dare prompts for quick ice-breakers & parties.",
    icon: <GiPuzzle />,
    tags: ["Engage", "Social", "Entertainment"],
  },

"network-status-hub": {
  label: "Live Status",
  description: "Real-time system health, uptime tracking and outage reports.",
  icon: <MdNetworkCheck   />,
  tags: ["Monitoring", "Incidents", "Operations"],
},

};

const DraggableCard = ({ document, index, moveCard, onOpenPreview }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const meta = typeMeta[document.type] || {
    label: "Web App",
    description: document.title,
    icon: <FiGrid />,
    tags: ["React", "Web App"],
  };

  const [, dragRef] = useDrag({
    type: "CARD",
    item: { index },
  });

  const [, dropRef] = useDrop({
    accept: "CARD",
    hover: (item) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
  });

  const handleOpenLive = (e) => {
    e.stopPropagation();
    window.open(document.url, "_blank", "noopener");
  };

  return (
    <div
      ref={(node) => dragRef(dropRef(node))}
      className="card"
      onClick={onOpenPreview}
    >
      <div className="card-badge">
        <span className="card-badge-icon">{meta.icon}</span>
        <span className="card-badge-text">{meta.label}</span>
      </div>

      <div className="card-image-wrapper">
        {isLoading && !imageLoaded && (
          <div className="card-loader">
            <Oval height={40} width={40} />
          </div>
        )}
        <img
          src={`/images/${document.type}.jpg`}
          alt={document.title}
          onLoad={() => {
            setImageLoaded(true);
            setIsLoading(false);
          }}
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      </div>

      <div className="card-content">
        <h4 className="card-title">{document.title}</h4>
        <p className="card-description">{meta.description}</p>

        <div className="card-tags">
          {meta.tags?.map((tag) => (
            <span key={tag} className="card-tag-pill">
              <FiCode className="card-tag-icon" />
              {tag}
            </span>
          ))}
        </div>

        <div className="card-footer">
          {/* SHORT, SWEET BTN */}
          <button className="card-primary-btn" onClick={handleOpenLive}>
            <FiExternalLink className="card-primary-icon" />
            <span>Visit Live</span>
          </button>

          <div className="card-footer-right">
            <span className="card-footer-text">Drag & Reorder</span>
            <FiMove className="card-drag-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [cards, setCards] = useState(() =>
    [...documents].sort((a, b) => a.position - b.position)
  );
  const [selectedDoc, setSelectedDoc] = useState(null);

  const moveCard = (fromIndex, toIndex) => {
    const updated = [...cards];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setCards(updated);
  };

  const handleOpenPreview = (doc) => setSelectedDoc(doc);
  const handleClosePreview = () => setSelectedDoc(null);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="page-root">
        <div className="background-orbit" />
        <div className="background-orbit second" />

        <header className="page-header">
          <div className="page-chip">
            <span className="page-chip-dot" />
            <span>PK • Live Creation Collection</span>
          </div>

          <h1 className="heading">Portfolio Hub</h1>

          <p className="subheading">
            All the products, tools and games I've built in one place.
          </p>

          <p className="subheading">
            Explore the cards to understand my work, style and tech skills.
          </p>

          <div className="page-meta-row">
            <div className="page-meta-item">
              <div
                className="creation-block"
                onClick={() =>
                  window.scrollBy({
                    top: 80,
                    behavior: "smooth",
                  })
                }
              >
                <span className="creation-label">Creations</span>
                <FiBox className="creation-icon" />
                <span className="creation-count">{cards.length}</span>
              </div>
            </div>

            <div className="page-meta-item">
              <a
                href="https://prudhvi-kollana-portfolio.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="author-btn"
              >
                <span>Built by</span>
                <span className="author-icon">
                  <FiUser />
                </span>
                PK
              </a>
            </div>

            <div className="page-meta-item">
              <a
                href="https://network-status-hub.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="live-status-btn"
              >
                <span className="live-dot" />
                Live Status
              </a>
            </div>
          </div>
        </header>

        <main className="main-container">
          <motion.div
            className="cards-container"
            layout
            transition={{ layout: { duration: 0.25 } }}
          >
            {cards.map((doc, index) => (
              <DraggableCard
                key={doc.type}
                document={doc}
                index={index}
                moveCard={moveCard}
                onOpenPreview={() => handleOpenPreview(doc)}
              />
            ))}
          </motion.div>
        </main>

        <AnimatePresence>
          {selectedDoc && (
            <Modal
              isOpen={!!selectedDoc}
              onRequestClose={handleClosePreview}
              className="image-modal"
              overlayClassName="image-modal-overlay"
              closeTimeoutMS={200}
            >
              <motion.div
                className="modal-inner"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="modal-header">
                  <div>
                    <p className="modal-kicker">Project preview</p>
                    <h2 className="modal-title">{selectedDoc.title}</h2>
                    <p className="modal-subkicker">
                      Part of my live project collection, built & maintained by
                      me.
                    </p>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={handleClosePreview}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-image-wrapper">
                  <img
                    src={`/images/${selectedDoc.type}.jpg`}
                    alt={selectedDoc.title}
                  />
                </div>

                <div className="modal-footer">
                  <p className="modal-subtext">
                    Open this app in a new tab to interact with the full
                    experience.
                  </p>
                  <a
                    href={selectedDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-cta"
                  >
                    <span>Visit live project</span>
                    <FiExternalLink className="modal-cta-icon" />
                  </a>
                </div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
      <p class="pk-credit">
        Made with
        <button
          class="pk-heart"
          aria-label="Love"
          title="Made with love by Prudhvi Kollana"
        >
          ❤
        </button>
        by
        <a
          href="https://prudhvi-kollana-portfolio.vercel.app/"
          target="_blank"
          rel="noopener"
          class="pk-author"
        >
          <img src={signature} alt="Prudhvi Kollana" class="pk-author-img" />
        </a>
        <span class="pk-note">
          <strong>— Portfolio Hub</strong>
        </span>
      </p>
    </DndProvider>
  );
};

export default App;
