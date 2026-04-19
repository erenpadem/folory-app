<mjml>
  <mj-head>
    <mj-title>E-posta doğrulama — {{ $appName }}</mj-title>
    <mj-attributes>
      <mj-all font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" />
    </mj-attributes>
    <mj-style inline="inline">
      .code-box { letter-spacing: 0.35em; font-weight: 700; font-size: 28px; color: #0f172a; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#f8fafc">
    <mj-section padding="24px 16px 0">
      <mj-column>
        <mj-text font-size="12px" color="#64748b" padding-bottom="8px">{{ $appName }}</mj-text>
        <mj-text font-size="22px" font-weight="700" padding-bottom="8px">E-postanızı doğrulayın</mj-text>
        <mj-text font-size="15px" color="#475569">Merhaba {{ $userName }},</mj-text>
        <mj-text font-size="15px" color="#475569">Yazar olmak ve kitap yayımlamak için aşağıdaki kodu uygulamada girin:</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="8px 16px 8px">
      <mj-column background-color="#ffffff" border-radius="12px" padding="28px 24px" border="1px solid #e2e8f0">
        <mj-text align="center" css-class="code-box">{{ $otp_code }}</mj-text>
        <mj-text align="center" font-size="13px" color="#94a3b8" padding-top="16px">Kod 15 dakika geçerlidir.</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="8px 16px 32px">
      <mj-column>
        <mj-text font-size="13px" color="#94a3b8">E-posta zaten doğrulandıysa bu mesajı yok sayabilirsiniz.</mj-text>
        <mj-button background-color="{{ $brandAccent }}" href="{{ $frontendUrl }}/profile?tab=settings" border-radius="8px" inner-padding="12px 24px" font-size="14px">Profil ayarlarına git</mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="0 16px 32px">
      <mj-column>
        <mj-divider border-color="#e2e8f0" />
        <mj-text font-size="11px" color="#cbd5e1" align="center">{{ $appName }}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
