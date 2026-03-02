"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Delete } from "lucide-react";

export function PinLoginPage({ onLoginSuccess, onSwitchToRegister }: { onLoginSuccess: (userId: string) => void, onSwitchToRegister: () => void }) {
    const [pin, setPin] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNumberClick = (num: number) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError(null);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(null);
    };

    const handleLogin = async () => {
        if (pin.length !== 4) {
            setError("El PIN debe tener 4 dígitos.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("pin", "==", pin));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError("PIN incorrecto. Intenta de nuevo.");
                setPin("");
            } else {
                const userDoc = querySnapshot.docs[0];
                onLoginSuccess(userDoc.id);
            }
        } catch (err) {
            console.error(err);
            setError("Error al verificar el PIN.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-dvh w-full items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Ingresa tu PIN</CardTitle>
                    <CardDescription>
                        Introduce tu código de 4 dígitos para acceder a tus gastos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 flex flex-col items-center">
                    {/* PIN Display */}
                    <div className="flex gap-4 mb-4">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={`w-12 h-14 rounded-lg flex items-center justify-center text-3xl font-bold border-2 transition-all ${pin.length > index
                                        ? "border-primary text-primary"
                                        : "border-muted-foreground/20 text-transparent"
                                    }`}
                            >
                                {pin.length > index ? "•" : ""}
                            </div>
                        ))}
                    </div>

                    {error && <div className="text-sm text-destructive text-center font-medium animate-in fade-in">{error}</div>}

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <Button
                                key={num}
                                variant="outline"
                                className="h-16 text-2xl font-semibold rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => handleNumberClick(num)}
                                disabled={isLoading || pin.length >= 4}
                            >
                                {num}
                            </Button>
                        ))}
                        <div className="col-start-1 col-end-2"></div>
                        <Button
                            variant="outline"
                            className="h-16 text-2xl font-semibold rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => handleNumberClick(0)}
                            disabled={isLoading || pin.length >= 4}
                        >
                            0
                        </Button>
                        <Button
                            variant="ghost"
                            className="h-16 text-xl rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={handleDelete}
                            disabled={isLoading || pin.length === 0}
                        >
                            <Delete className="h-8 w-8" />
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-2">
                    <Button
                        className="w-full py-6 text-lg"
                        onClick={handleLogin}
                        disabled={pin.length !== 4 || isLoading}
                    >
                        {isLoading ? "Verificando..." : "Ingresar"}
                    </Button>
                    <Button variant="link" onClick={onSwitchToRegister} className="w-full">
                        No tengo PIN. Registrarme
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
