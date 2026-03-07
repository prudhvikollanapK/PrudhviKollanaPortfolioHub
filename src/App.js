import React, { useEffect, useMemo, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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
  FiGlobe,
  FiUser,
  FiMonitor,
  FiList,
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiSliders,
  FiMail,
  FiSend,
  FiStar,
  FiZap,
  FiLayers,
  FiGithub,
  FiLinkedin,
  FiArrowUpRight,
} from "react-icons/fi";
import { MdNetworkCheck } from "react-icons/md";
import { GiGamepad, GiPuzzle } from "react-icons/gi";

import signature from "./assets/images/signature.png";
import fallbackCreations from "./fallbackCreations";
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import "./App.css";

Modal.setAppElement("#root");

const iconMap = {
  Grid: <FiGrid />,
  Globe: <FiGlobe />,
  BarChart2: <FiBarChart2 />,
  Gamepad2: <GiGamepad />,
  Cpu: <FiCpu />,
  List: <FiList />,
  Monitor: <FiMonitor />,
  Puzzle: <GiPuzzle />,
  Activity: <MdNetworkCheck />,
};

const toOrderValue = (card) => {
  const rawOrder = card?.order;
  const parsedOrder = Number(rawOrder);
  if (Number.isFinite(parsedOrder)) return parsedOrder;
  return Number.MAX_SAFE_INTEGER;
};

const normalizeCard = (card) => ({
  ...card,
  order: toOrderValue(card),
});

const fallbackCards = (fallbackCreations || [])
  .filter((card) => card.display === true && card.is_hub !== true)
  .map(normalizeCard)
  .sort(
    (a, b) =>
      toOrderValue(a) - toOrderValue(b) ||
      (a.created_at || "").localeCompare(b.created_at || "")
  );

const cardsContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 135,
      damping: 18,
      mass: 0.55,
    },
  },
};

const LoadingSkeleton = () => (
  <div className="cards-container cards-skeleton-container">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div key={idx} className="card skeleton-card">
        <div className="skeleton-badge skeleton-shimmer" />
        <div className="skeleton-image skeleton-shimmer" />
        <div className="skeleton-line skeleton-shimmer" />
        <div className="skeleton-line short skeleton-shimmer" />
        <div className="skeleton-tags-row">
          <div className="skeleton-tag skeleton-shimmer" />
          <div className="skeleton-tag skeleton-shimmer" />
          <div className="skeleton-tag skeleton-shimmer" />
        </div>
        <div className="skeleton-footer">
          <div className="skeleton-btn skeleton-shimmer" />
          <div className="skeleton-mini skeleton-shimmer" />
        </div>
      </div>
    ))}
  </div>
);

const DraggableCard = ({ document, index, moveCard, onOpenPreview }) => {
  const [imageStatus, setImageStatus] = useState("loading");
  const imageSources = useMemo(() => {
    const sources = [];
    if (document.image) sources.push(document.image);
    sources.push(`/images/${document.type}.jpg`);
    sources.push("/images/portfolio.jpg");
    return [...new Set(sources)];
  }, [document.image, document.type]);
  const [imageIndex, setImageIndex] = useState(0);
  const imageSrc = imageSources[imageIndex];

  useEffect(() => {
    setImageIndex(0);
    setImageStatus("loading");
  }, [document.image, document.type]);

  useEffect(() => {
    if (imageStatus !== "loading") {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (imageIndex < imageSources.length - 1) {
        setImageIndex((prev) => prev + 1);
      } else {
        setImageStatus("failed");
      }
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, [imageIndex, imageSources.length, imageStatus]);

  const meta = useMemo(
    () => ({
      label: document.label || "Web App",
      description: document.description || document.title,
      icon: iconMap[document.icon] || <FiGrid />,
      tags:
        Array.isArray(document.tags) && document.tags.length > 0
          ? document.tags
          : ["Creation", "Web App"],
    }),
    [document.description, document.icon, document.label, document.tags, document.title]
  );

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
        {imageStatus === "loading" && (
          <div className="card-loader">
            <div className="card-inline-skeleton skeleton-shimmer" />
          </div>
        )}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={document.title}
            onLoad={() => {
              setImageStatus("loaded");
            }}
            onError={() => {
              if (imageIndex < imageSources.length - 1) {
                setImageIndex((prev) => prev + 1);
              } else {
                setImageStatus("failed");
              }
            }}
            style={{ opacity: imageStatus === "loaded" ? 1 : 0 }}
          />
        ) : (
          <div className="card-image-fallback">Preview unavailable</div>
        )}
        {imageStatus === "failed" && (
          <div className="card-image-fallback">Preview unavailable</div>
        )}
      </div>

      <div className="card-content">
        <h4 className="card-title">{document.title}</h4>
        <p className="card-description">{meta.description}</p>

        <div className="card-tags">
          {meta.tags.map((tag) => (
            <span key={tag} className="card-tag-pill">
              <FiCode className="card-tag-icon" />
              {tag}
            </span>
          ))}
        </div>

        <div className="card-footer">
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
  const [cards, setCards] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [modalImageFailed, setModalImageFailed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("All");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [dataSource, setDataSource] = useState("fallback");
  const [showSourceDebug, setShowSourceDebug] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallAvailable, setIsInstallAvailable] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installHelpText, setInstallHelpText] = useState("");
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("idle");
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [isFooterImageModalOpen, setIsFooterImageModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hasSourceParam = params.has("source") || params.get("pk_source") === "1";
    const localDebug = window.localStorage.getItem("pk_source_debug");
    setShowSourceDebug(hasSourceParam || localDebug === "1");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeenBanner = window.localStorage.getItem("pk_pwa_banner_seen") === "1";
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (hasSeenBanner || isStandalone) return;

    const timerId = window.setTimeout(() => {
      setShowInstallBanner(true);
    }, 5000);

    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isIos = /iPad|iPhone|iPod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIos && isSafari) {
      setInstallHelpText("Use Share -> Add to Home Screen.");
    } else {
      setInstallHelpText("Install is available in supported browsers.");
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallAvailable(true);
      setInstallHelpText("Tap Install to add this app to your device.");
    };

    const handleAppInstalled = () => {
      window.localStorage.setItem("pk_pwa_banner_seen", "1");
      setShowInstallBanner(false);
      setIsInstallAvailable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCreations = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (isMounted) {
          setFetchError("");
          setCards(fallbackCards);
          setDataSource("fallback");
          setIsFetching(false);
        }
        return;
      }

      setIsFetching(true);
      setFetchError("");

      const { data, error } = await supabase
        .from("creations")
        .select(
          "id, type, title, url, label, description, icon, tags, image, created_at, display, is_hub, order"
        )
        .eq("display", true)
        .eq("is_hub", false)
        .order("order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (error) {
        setFetchError("");
        setCards(fallbackCards);
        setDataSource("fallback");
      } else {
        const filteredCards = (data || [])
          .filter((card) => card.display === true && card.is_hub !== true)
          .map(normalizeCard)
          .sort(
            (a, b) =>
              toOrderValue(a) - toOrderValue(b) ||
              (a.created_at || "").localeCompare(b.created_at || "")
          );
        setCards(filteredCards);
        setDataSource("db");
      }

      setIsFetching(false);
    };

    fetchCreations();

    return () => {
      isMounted = false;
    };
  }, []);

  const moveCard = (fromIndex, toIndex) => {
    const updated = [...cards];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setCards(updated);
  };

  const handleOpenPreview = (doc) => {
    setModalImageFailed(false);
    setSelectedDoc(doc);
  };
  const handleClosePreview = () => {
    setModalImageFailed(false);
    setSelectedDoc(null);
  };

  const filterOptions = useMemo(() => {
    const options = new Set(["All"]);
    cards.forEach((card) => {
      if (card.label) options.add(card.label);
    });
    return Array.from(options);
  }, [cards]);

  const displayedCards = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return cards.filter((card) => {
      const passLabel =
        selectedLabel === "All" || (card.label || "") === selectedLabel;

      if (!passLabel) return false;

      if (!term) return true;

      const searchable = [
        card.title,
        card.type,
        card.label,
        card.description,
        ...(Array.isArray(card.tags) ? card.tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [cards, searchTerm, selectedLabel]);

  const handleDismissInstallBanner = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pk_pwa_banner_seen", "1");
    }
    setShowInstallBanner(false);
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt || !isInstallAvailable) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted" && typeof window !== "undefined") {
      window.localStorage.setItem("pk_pwa_banner_seen", "1");
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
    setIsInstallAvailable(false);
  };

  const handleSubscribe = async (event) => {
    event.preventDefault();

    const email = subscriberEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setSubscribeStatus("error");
      setSubscribeMessage("Enter a valid email address.");
      return;
    }

    try {
      setSubscribeStatus("loading");
      setSubscribeMessage("");

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Subscription failed");
      }

      setSubscribeStatus("success");
      setSubscribeMessage("You are subscribed. Check your inbox.");
      setSubscriberEmail("");
    } catch (error) {
      setSubscribeStatus("error");
      setSubscribeMessage(
        error.message || "Unable to subscribe now. Please try again."
      );
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="page-root">
        <div className="background-orbit" />
        <div className="background-orbit second" />

        <header className="page-header">
          <div className="page-chip">
            <span className="page-chip-dot" />
            <span>PK - Live Creation Collection</span>
          </div>
          {showSourceDebug && (
            <div className={`source-pill ${dataSource}`}>
              <span className="source-pill-dot" />
              {dataSource === "db" ? "Source: DB" : "Source: Data"}
            </div>
          )}

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
                <span className="creation-count">{displayedCards.length}</span>
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
          <section className="search-shell">
            <div className="search-top-row">
              <div className="search-input-wrap">
                <FiSearch className="search-input-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search creations, tags, tech..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search creations"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <FiX />
                  </button>
                )}
              </div>
              <button
                type="button"
                className={`search-filter-icon-btn ${
                  isMobileFiltersOpen ? "active" : ""
                }`}
                onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                aria-expanded={isMobileFiltersOpen}
                aria-controls="creation-filters"
                aria-label="Toggle filters"
              >
                <FiSliders />
                {isMobileFiltersOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            <div
              id="creation-filters"
              className={`search-filters ${isMobileFiltersOpen ? "open" : ""}`}
            >
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`search-filter-pill ${
                    selectedLabel === option ? "active" : ""
                  }`}
                  onClick={() => setSelectedLabel(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          {isFetching && (
            <LoadingSkeleton />
          )}

          {!isFetching && fetchError && (
            <div className="cards-status">
              <p className="subheading">{fetchError}</p>
            </div>
          )}

          {!isFetching && !fetchError && cards.length === 0 && (
            <div className="cards-status">
              <p className="subheading">No creations found.</p>
            </div>
          )}

          {!isFetching &&
            !fetchError &&
            cards.length > 0 &&
            displayedCards.length === 0 && (
              <div className="cards-status">
                <p className="subheading">
                  No creations match your search or filter.
                </p>
              </div>
            )}

          {!isFetching && !fetchError && displayedCards.length > 0 && (
            <motion.div
              className="cards-container"
              layout
              variants={cardsContainerVariants}
              initial="hidden"
              animate="show"
              transition={{ layout: { duration: 0.32 } }}
            >
              {displayedCards.map((doc, index) => (
                <motion.div
                  key={doc.id || doc.type}
                  className="card-item-motion"
                  layout
                  variants={cardItemVariants}
                >
                  <DraggableCard
                    document={doc}
                    index={index}
                    moveCard={moveCard}
                    onOpenPreview={() => handleOpenPreview(doc)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
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
                      Part of my live project collection, built and maintained by me.
                    </p>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={handleClosePreview}
                  >
                    X
                  </button>
                </div>

                <div className="modal-image-wrapper">
                  {!modalImageFailed ? (
                    <img
                      src={selectedDoc.image || `/images/${selectedDoc.type}.jpg`}
                      alt={selectedDoc.title}
                      onError={() => setModalImageFailed(true)}
                    />
                  ) : (
                    <div className="card-image-fallback">Preview unavailable</div>
                  )}
                </div>

                <div className="modal-footer">
                  <p className="modal-subtext">
                    Open this app in a new tab to interact with the full experience.
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
        <AnimatePresence>
          {showInstallBanner && (
            <motion.div
              className="pwa-install-banner"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 22 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="pwa-install-head-row">
                <div className="pwa-install-icon-wrap">
                  <FiDownload className="pwa-install-icon" />
                </div>
                <p className="pwa-install-title">Install Portfolio Hub</p>
              </div>
              <p className="pwa-install-subtitle">
                Add to your home screen for a faster, app-like experience.
              </p>
              {!isInstallAvailable && (
                <p className="pwa-install-help">{installHelpText}</p>
              )}
              <div className="pwa-install-actions">
                <button
                  type="button"
                  className="pwa-dismiss-btn"
                  onClick={handleDismissInstallBanner}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className={`pwa-install-btn ${
                    isInstallAvailable ? "" : "disabled"
                  }`}
                  onClick={handleInstallApp}
                  disabled={!isInstallAvailable}
                >
                  <FiDownload />
                  Install
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="premium-footer">
          <div className="footer-bg-glow" />
          <div className="footer-grid">
            <section className="footer-left">
              <div className="footer-brand-row">
                <button
                  type="button"
                  className="footer-brand-image-btn"
                  onClick={() => setIsFooterImageModalOpen(true)}
                  aria-label="Open Portfolio Hub brand image"
                >
                  <img
                    src="/favicon.png"
                    alt="Portfolio Hub"
                    className="footer-brand-image"
                  />
                </button>
                <div className="footer-brand-content">
                  {/* <p className="footer-eyebrow">Project</p> */}
                  <h3 className="footer-title">Portfolio Hub</h3>
                  <p className="footer-description">
                    A unified showcase of my creations, experiments, tools, and games
                    with live previews, modern UX, and production-ready quality.
                  </p>
                </div>
              </div>
              <div className="footer-feature-row">
                <span className="footer-feature-pill">
                  <FiStar />
                  Curated Builds
                </span>
                <span className="footer-feature-pill">
                  <FiZap />
                  Real-time Updates
                </span>
                <span className="footer-feature-pill">
                  <FiLayers />
                  Multi-product Hub
                </span>
              </div>
            </section>

            <section className="footer-middle">
              <h4 className="footer-subtitle">Explore</h4>
              <div className="footer-links-grid">
                <a
                  href="https://prudhvi-kollana-portfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-card"
                >
                  Main Portfolio <FiArrowUpRight />
                </a>
                <a
                  href="https://network-status-hub.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-card"
                >
                  Live Status <FiGlobe />
                </a>
                <a
                  href="https://github.com/prudhvikollanapK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-card"
                >
                  GitHub <FiGithub />
                </a>
                <a
                  href="https://www.linkedin.com/in/prudhvikollanapk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-card"
                >
                  LinkedIn <FiLinkedin />
                </a>
              </div>
            </section>

            <section className="footer-right">
              <h4 className="footer-subtitle">Receive Updates</h4>
              {/* <p className="footer-form-copy">
                Get premium release notes whenever I launch a new creation.
              </p> */}
              
              <p className="footer-innovative-point">
                Instantly access clear, impact-focused release notes every time a new creation goes live, so you know exactly what’s new and why it matters.
              </p>
              <form className="footer-form" onSubmit={handleSubscribe}>
                <div className="footer-input-wrap">
                  <FiMail className="footer-input-icon" />
                  <input
                    type="email"
                    value={subscriberEmail}
                    onChange={(event) => setSubscriberEmail(event.target.value)}
                    placeholder="Enter your email"
                    className="footer-input"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={`footer-submit-btn ${
                    subscribeStatus === "loading" ? "loading" : ""
                  }`}
                  disabled={subscribeStatus === "loading"}
                >
                  <FiSend />
                  {subscribeStatus === "loading" ? "Sending..." : "Subscribe"}
                </button>
              </form>
              {subscribeMessage && (
                <p
                  className={`footer-feedback ${
                    subscribeStatus === "success" ? "success" : "error"
                  }`}
                >
                  {subscribeMessage}
                </p>
              )}
            </section>
          </div>

          <div className="footer-bottom-row">
            <p className="footer-copyright">
              Copyright {currentYear} Prudhvi Kollana. Portfolio Hub.
            </p>
            <p className="pk-credit footer-signature">
              Made with
              <button
                className="pk-heart"
                aria-label="Love"
                title="Made with love by Prudhvi Kollana"
              >
                Love
              </button>
              by
              <a
                href="https://prudhvi-kollana-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="pk-author"
              >
                <img src={signature} alt="Prudhvi Kollana" className="pk-author-img" />
              </a>
              <span className="pk-note">
                <strong>- Portfolio Hub</strong>
              </span>
            </p>
          </div>
        </footer>
      </div>
      <AnimatePresence>
        {isFooterImageModalOpen && (
          <Modal
            isOpen={isFooterImageModalOpen}
            onRequestClose={() => setIsFooterImageModalOpen(false)}
            className="footer-brand-modal"
            overlayClassName="image-modal-overlay"
            closeTimeoutMS={200}
          >
            <motion.div
              className="footer-brand-modal-inner"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="modal-close-btn"
                onClick={() => setIsFooterImageModalOpen(false)}
              >
                X
              </button>
              <img
                src="/favicon.png"
                alt="Portfolio Hub brand"
                className="footer-brand-modal-image"
              />
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </DndProvider>
  );
};

export default App;
