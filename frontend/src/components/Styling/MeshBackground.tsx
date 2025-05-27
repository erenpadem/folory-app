import React from 'react'

export default function MeshBackground() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div
                className="absolute inset-0 bg-gradient-to-br from-primary via-muted-foreground/5 to-muted-foreground"
                style={{
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)'
                }}
            />
        </div>
    )
}
