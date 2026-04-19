<mjml>
  <mj-head>
    <mj-title>Yeni kitap — {{ $authorName }}</mj-title>
    <mj-attributes>
      <mj-all font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f1f5f9">
    <mj-section padding="24px 16px 0">
      <mj-column>
        <mj-text font-size="12px" color="#64748b">{{ $appName }}</mj-text>
        <mj-text font-size="22px" font-weight="700" padding-top="8px">Yeni bir kitap yayınlandı</mj-text>
        <mj-text font-size="15px" color="#475569">{{ $authorName }} yeni bir kitap paylaştı.</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="16px">
      <mj-column background-color="#ffffff" border-radius="12px" border="1px solid #e2e8f0" padding="0">
        @if(!empty($bookCover))
        <mj-image src="{{ $bookCover }}" alt="{{ $bookTitle }}" border-radius="12px 12px 0 0" fluid-on-mobile="true" />
        @endif
        <mj-text padding="20px 24px 8px" font-size="18px" font-weight="700">{{ $bookTitle }}</mj-text>
        @if($bookDescriptionShort !== '')
        <mj-text padding="0 24px 20px" font-size="14px" color="#64748b">{{ $bookDescriptionShort }}</mj-text>
        @endif
        <mj-button background-color="{{ $brandPrimary }}" href="{{ $bookUrl }}" border-radius="8px" inner-padding="12px 24px" align="center" padding-bottom="24px">Kitaba git</mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="0 16px 32px">
      <mj-column>
        <mj-text font-size="11px" color="#cbd5e1" align="center">{{ $appName }}</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
