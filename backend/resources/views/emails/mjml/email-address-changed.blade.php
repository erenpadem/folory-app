<mjml>
  <mj-head>
    <mj-title>E-posta değişti — {{ $appName }}</mj-title>
    <mj-attributes>
      <mj-all font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f8fafc">
    <mj-section padding="24px 16px 0">
      <mj-column>
        <mj-text font-size="12px" color="#64748b" padding-bottom="8px">{{ $appName }}</mj-text>
        <mj-text font-size="22px" font-weight="700" padding-bottom="8px">E-posta adresiniz değiştirildi</mj-text>
        <mj-text font-size="15px" color="#475569">Merhaba {{ $userName }},</mj-text>
        <mj-text font-size="15px" color="#475569">Hesabınızın e-posta adresi güncellendi.</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="8px 16px 8px">
      <mj-column background-color="#ffffff" border-radius="12px" padding="24px" border="1px solid #e2e8f0">
        <mj-text font-size="14px" color="#475569"><strong>Eski adres:</strong> {{ $oldEmail }}</mj-text>
        <mj-text font-size="14px" color="#475569" padding-top="8px"><strong>Yeni adres:</strong> {{ $newEmail }}</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="8px 16px 32px">
      <mj-column>
        <mj-text font-size="13px" color="#94a3b8">Bu işlemi siz yapmadıysanız hemen şifrenizi sıfırlayın ve destek ile iletişime geçin.</mj-text>
        <mj-button background-color="{{ $brandAccent }}" href="{{ $frontendUrl }}/auth/forgot-password" border-radius="8px" inner-padding="12px 24px" font-size="14px">Şifre sıfırlama</mj-button>
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
