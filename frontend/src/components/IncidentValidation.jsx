import { useEffect, useState } from "react";
import {
    fetchAcknowledgements,
    acknowledgeIncident,
} from "../api/incidentApi";

const LEVEL_ORDER = ["USER", "MANAGER", "SUPERVISOR"];

export default function IncidentValidation({ measurementId, userRole }) {
    const [acks, setAcks] = useState([]);
    const [comments, setComments] = useState({});
    const [loading, setLoading] = useState(false);

    const normalizedRole = userRole?.toUpperCase();

    useEffect(() => {
        if (!measurementId) return;

        loadAcknowledgements();
    }, [measurementId]);

    const loadAcknowledgements = async () => {
        try {
            setLoading(true);
            const data = await fetchAcknowledgements(measurementId);

            const sorted = data.sort(
                (a, b) =>
                    LEVEL_ORDER.indexOf(a.level) -
                    LEVEL_ORDER.indexOf(b.level)
            );

            setAcks(sorted);
        } catch (err) {
            console.error("Erreur chargement acknowledgements", err);
        } finally {
            setLoading(false);
        }
    };

    // const handleSubmit = async (level) => {
    //     try {
    //         setLoading(true);

    //         await acknowledgeIncident(measurementId, {
    //             level,
    //             comment: comments[level] || "",
    //         });

    //         await loadAcknowledgements();
    //         setComments((prev) => ({ ...prev, [level]: "" }));
    //     } catch (err) {
    //         alert("Erreur lors de la validation");
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const handleSubmit = async (level) => {
    console.log("SEND", {
        measurementId,
        level,
        comment: comments[level],
    });

    await acknowledgeIncident(measurementId, {
        level,
        comment: comments[level],
    });

    await loadAcknowledgements();
};


    /**
     * Escalade :
     * USER toujours possible
     * MANAGER après USER
     * SUPERVISOR après MANAGER
     */
    const canAcknowledge = (level) => {
        if (level === "USER") return true;

        if (level === "MANAGER")
            return acks.find((a) => a.level === "USER")?.acknowledged;

        if (level === "SUPERVISOR")
            return acks.find((a) => a.level === "MANAGER")?.acknowledged;

        return false;
    };

    const canEdit =
        (level, acknowledged) =>
            normalizedRole === level &&
            canAcknowledge(level) &&
            !acknowledged;

    if (loading && !acks.length) {
        return <p>Chargement...</p>;
    }

    return (
        <div>
            <h3>🚨 Validation de l’incident</h3>

            {acks.map((ack) => {
                const editable = canEdit(ack.level, ack.acknowledged);

                return (
                    <div
                        key={ack.id}
                        style={{
                            marginBottom: "1rem",
                            padding: "1rem",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            background: ack.acknowledged
                                ? "#f9f9f9"
                                : "#fff",
                            opacity: canAcknowledge(ack.level) ? 1 : 0.4,
                        }}
                    >
                        {/* HEADER */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <h4>{ack.level}</h4>

                            {/* Checkbox "alerte reçue" */}
                            <label style={{ fontSize: "0.9rem" }}>
                                <input
                                    type="checkbox"
                                    checked={ack.acknowledged}
                                    disabled
                                />{" "}
                                {ack.acknowledged
                                    ? "Alerte reçue"
                                    : "En attente"}
                            </label>
                        </div>

                        {/* COMMENTAIRE */}
                        {ack.acknowledged ? (
                            <div
                                style={{
                                    marginTop: "0.5rem",
                                    background: "#f1f1f1",
                                    padding: "0.5rem",
                                    borderRadius: "6px",
                                }}
                            >
                                💬 {ack.comment || "—"}
                            </div>
                        ) : (
                            <>
                                <textarea
                                    placeholder={
                                        canAcknowledge(ack.level)
                                            ? "Décrire l'action prise..."
                                            : "En attente de validation précédente"
                                    }
                                    value={comments[ack.level] || ""}
                                    disabled={!editable}
                                    onChange={(e) =>
                                        setComments((prev) => ({
                                            ...prev,
                                            [ack.level]: e.target.value,
                                        }))
                                    }
                                    style={{
                                        width: "100%",
                                        minHeight: "70px",
                                        marginTop: "0.5rem",
                                    }}
                                />

                                <button
                                    style={{
                                        marginTop: "0.5rem",
                                        padding: "6px 12px",
                                        cursor: editable
                                            ? "pointer"
                                            : "not-allowed",
                                    }}
                                    disabled={!editable || loading}
                                    onClick={() =>
                                        handleSubmit(ack.level)
                                    }
                                >
                                    Valider
                                </button>
                            </>
                        )}
                    </div>
                );
            })}

            {/* VUE SUPERVISOR – résumé global */}
            {normalizedRole === "SUPERVISOR" && acks.length > 1 && (
                <div
                    style={{
                        marginTop: "1.5rem",
                        padding: "1rem",
                        border: "1px solid #aaa",
                        borderRadius: "8px",
                        background: "#fafafa",
                    }}
                >
                    <h4>🛡️ Vue globale (Supervisor)</h4>

                    {acks.map((ack) => (
                        <p key={ack.id}>
                            <strong>{ack.level}</strong> :{" "}
                            {ack.comment || "—"}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
