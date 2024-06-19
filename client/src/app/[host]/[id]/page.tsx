"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const DetailsDevice = () => {
    const params = useParams();
    const { id } = params;
    const [device, setDevice] = useState<any>(null);
    const [backups, setBackups] = useState<any[]>([]);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

    console.log(device);
    

    const fetchDeviceDetails = async () => {
        try {
            const response = await fetch(`http://localhost:3001/devices/${id}`);
            const data = await response.json();
            setDevice(data);
        } catch (error) {
            console.error('Error fetching device details:', error);
        }
    };

    const fetchBackups = async () => {
        try {
            const response = await fetch(`http://localhost:3001/devices/${id}/backups`);
            const data = await response.json();
            setBackups(data);
        } catch (error) {
            console.error('Error fetching backups:', error);
        }
    };

    const createBackup = async () => {
        try {
            const response = await fetch(`http://localhost:3001/devices/${id}/backups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                startCountdown();
            } else {
                console.error('Error creating backup:', await response.text());
            }
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    };

    const startCountdown = () => {
        setCountdown(7);
        setRefreshMessage('La página se actualizará en 7 segundos...');
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(interval);
                    window.location.reload();
                }
                return prev ? prev - 1 : null;
            });
        }, 1000);
    };

    const refreshNow = () => {
        window.location.reload();
    };

    useEffect(() => {
        if (id) {
            fetchDeviceDetails();
            fetchBackups();
        }
    }, [id]);

    if (!device) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4 w-full">
             {refreshMessage && (
                            <div className="absolute alert alert-success">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM18.58 32.58L11.4 25.4C10.62 24.62 10.62 23.36 11.4 22.58C12.18 21.8 13.44 21.8 14.22 22.58L20 28.34L33.76 14.58C34.54 13.8 35.8 13.8 36.58 14.58C37.36 15.36 37.36 16.62 36.58 17.4L21.4 32.58C20.64 33.36 19.36 33.36 18.58 32.58Z" fill="#00BA34" />
                            </svg>
                            <div className="flex flex-col">
                                <span>Se ha Creado un Nuevo Backup</span>
                                <span className="text-content2">{refreshMessage}</span>
                                <span className='cursor-pointer bg-blue-500 hover:bg-blue-700 duration-150 p-2 inline-flex rounded-lg flex justify-center text-black font-semibold' onClick={refreshNow}>Refrescar Ahora</span>
                            </div>
                        </div>
            )}
            <h1 className="text-2xl font-bold mb-4">Detalles del Dispositivo</h1>
            <div className="flex w-full overflow-x-auto px-36">
	            <table className="table-zebra table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Host</th>
                            <th>Nombre</th>
                            <th>Usuario</th>
                            <th>Contraseña</th>
                            <th>Frecuencia</th>
                            <th>Límite de Backups</th>
                            <th>Crear Nuevo Backup</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>{device.id}</th>
                            <td>{device.host}</td>
                            <td>{device.name}</td>
                            <td>{device.username}</td>
                            <td>{device.password}</td>
                            <td>{device.frequency_minutes}</td>
                            <td>{device.max_backup_limit}</td>
                            <td onClick={createBackup} className='cursor-pointer bg-blue-500 text-center p-2 rounded-lg hover:bg-blue-700 duration-150 mt-4'>Click</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <h2 className="text-xl font-semibold mt-4">Información de Backups</h2>
            {backups.length > 0 ? (
                <table className="table-zebra table px-36">
                <thead>
                    <tr>
                        <th>Número de Backup</th>
                        <th>Nombre</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                {backups.map((backup, id) => (
                    <tr key={backup.name}>
                        <th>{id+1}</th>
                        <td>{backup.name}</td>
                        <td>{backup.date}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
                <p>No hay backups disponibles.</p>
            )}
        </div>
    );
};

export default DetailsDevice;
